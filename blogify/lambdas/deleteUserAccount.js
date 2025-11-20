const { CognitoIdentityProviderClient, DeleteUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const claims = event.requestContext.authorizer?.jwt?.claims || event.requestContext.authorizer?.claims || {};
    const userId = claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized - No user ID in token" })
      };
    }

    const accessToken = event.headers.authorization?.split(' ')[1] || event.headers.Authorization?.split(' ')[1];

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Access token required" })
      };
    }

    try {
      await docClient.send(new DeleteCommand({
        TableName: process.env.USERS_TABLE,
        Key: { userId }
      }));
    } catch (error) {
      console.error("Error deleting user profile:", error);
    }

    await cognitoClient.send(new DeleteUserCommand({
      AccessToken: accessToken
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Account deleted successfully",
        userId
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to delete account",
        error: error.message
      })
    };
  }
};
