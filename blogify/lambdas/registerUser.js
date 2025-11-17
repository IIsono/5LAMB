const { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password, username, displayName } = body;

    // Validation
    if (!email || !password || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email, password, and username are required",
          required: ["email", "password", "username"]
        })
      };
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid email format" })
      };
    }

    // Valider le mot de passe
    if (password.length < 8) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Password must be at least 8 characters long"
        })
      };
    }

    // Valider le username
    if (username.length < 3 || username.length > 20) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Username must be between 3 and 20 characters"
        })
      };
    }

    // Créer l'utilisateur dans Cognito
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

    // Auto-confirmer l'utilisateur si en mode dev/admin
    if (process.env.AUTO_CONFIRM_USERS === "true") {
      try {
        await cognitoClient.send(new AdminConfirmSignUpCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: username
        }));
      } catch (error) {
        console.log("Could not auto-confirm user:", error.message);
        // Continue même si l'auto-confirmation échoue
      }
    }

    // Créer le profil utilisateur dans DynamoDB
    const userProfile = {
      userId,
      email,
      username,
      displayName: displayName || username,
      bio: "",
      avatar: "",
      website: "",
      location: "",
      role: "user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      emailVerified: false
    };

    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: userProfile,
      // Ne pas écraser si existe déjà
      ConditionExpression: "attribute_not_exists(userId)"
    }));

    return {
      statusCode: 201,
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

    // Erreurs spécifiques de Cognito
    if (error.name === "UsernameExistsException") {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Username already exists",
          field: "username"
        })
      };
    }

    if (error.name === "InvalidPasswordException") {
      return {
        statusCode: 400,
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
        body: JSON.stringify({
          message: error.message || "Invalid parameters"
        })
      };
    }

    // Erreur DynamoDB - utilisateur déjà existe
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "User profile already exists"
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Registration failed",
        error: error.message
      })
    };
  }
};
