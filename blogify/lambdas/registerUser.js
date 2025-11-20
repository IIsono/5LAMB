const { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand, AdminUpdateUserAttributesCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password, username, displayName, role } = body;

    if (!email || !password || !username) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Email, password, and username are required",
          required: ["email", "password", "username"]
        })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid email format" })
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Password must be at least 8 characters long"
        })
      };
    }

    if (username.length < 3 || username.length > 20) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Username must be between 3 and 20 characters"
        })
      };
    }

    const signUpResult = await cognitoClient.send(new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email
        }
      ]
    }));

    const userId = signUpResult.UserSub;

    // Valider et définir le rôle (par défaut "user")
    const validRoles = ["user", "editor", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "user";

    if (process.env.AUTO_CONFIRM_USERS === "true") {
      try {
        await cognitoClient.send(new AdminConfirmSignUpCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: username
        }));
      } catch (error) {
        console.log("Could not auto-confirm user:", error.message);
      }
    }

    // Définir l'attribut custom role dans Cognito
    try {
      await cognitoClient.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: username,
        UserAttributes: [
          {
            Name: "custom:role",
            Value: userRole
          }
        ]
      }));
    } catch (error) {
      console.error("Could not set role in Cognito:", error.message);
    }

    const userProfile = {
      userId,
      email,
      username,
      displayName: displayName || username,
      bio: "",
      avatar: "",
      website: "",
      location: "",
      role: userRole,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      emailVerified: false
    };

    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: userProfile,
      ConditionExpression: "attribute_not_exists(userId)"
    }));

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "User registered successfully",
        userId,
        username,
        email,
        confirmationRequired: process.env.AUTO_CONFIRM_USERS !== "true",
        note: process.env.AUTO_CONFIRM_USERS !== "true"
          ? "Please check your email to confirm your account"
          : "Account created and confirmed"
      })
    };

  } catch (error) {
    console.error(error);

    if (error.name === "UsernameExistsException") {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Username already exists",
          field: "username"
        })
      };
    }

    if (error.name === "InvalidPasswordException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Password does not meet requirements",
          requirements: [
            "At least 8 characters",
            "At least one uppercase letter",
            "At least one lowercase letter",
            "At least one number",
            "At least one special character"
          ]
        })
      };
    }

    if (error.name === "InvalidParameterException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: error.message || "Invalid parameters"
        })
      };
    }

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "User profile already exists"
        })
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Registration failed",
        error: error.message
      })
    };
  }
};
