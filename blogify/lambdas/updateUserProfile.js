const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const cognitoClient = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const claims = event.requestContext.authorizer?.jwt?.claims || event.requestContext.authorizer?.claims || {};
    const userId = claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Unauthorized - No user ID in token" })
      };
    }

    const body = JSON.parse(event.body);

    let existingProfile = null;
    try {
      const result = await docClient.send(new GetCommand({
        TableName: process.env.USERS_TABLE,
        Key: { userId }
      }));
      existingProfile = result.Item;
    } catch (error) {
      console.log("No existing profile found, creating new one");
    }

    const allowedFields = ["displayName", "bio", "avatar", "website", "location", "role"];
    const updates = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Valider le rôle si fourni
    if (updates.role) {
      const validRoles = ["user", "editor", "admin"];
      if (!validRoles.includes(updates.role)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Invalid role. Must be: user, editor, or admin" })
        };
      }
    }

    const email = claims.email;
    const username = claims['cognito:username'];

    const userProfile = {
      userId,
      email,
      username,
      role: updates.role || existingProfile?.role || "user",
      createdAt: existingProfile?.createdAt || Date.now(),
      updatedAt: Date.now(),
      ...updates
    };

    // Synchroniser le rôle avec Cognito si modifié
    if (updates.role && updates.role !== existingProfile?.role) {
      try {
        await cognitoClient.send(new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: username,
          UserAttributes: [
            {
              Name: "custom:role",
              Value: updates.role
            }
          ]
        }));
      } catch (error) {
        console.error("Could not update role in Cognito:", error.message);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Failed to update role in authentication system" })
        };
      }
    }

    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: userProfile
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(userProfile)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
