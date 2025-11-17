const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { userId } = event.pathParameters;

    const result = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" })
      };
    }

    // Retourner uniquement les informations publiques
    const publicProfile = {
      userId: result.Item.userId,
      username: result.Item.username,
      displayName: result.Item.displayName || result.Item.username,
      bio: result.Item.bio || "",
      avatar: result.Item.avatar || "",
      website: result.Item.website || "",
      location: result.Item.location || "",
      createdAt: result.Item.createdAt
    };

    return {
      statusCode: 200,
      body: JSON.stringify(publicProfile)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
