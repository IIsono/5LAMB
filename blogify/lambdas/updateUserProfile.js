const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const body = JSON.parse(event.body);

    // Récupérer le profil existant ou créer les données de base
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

    // Champs autorisés à la mise à jour
    const allowedFields = ["displayName", "bio", "avatar", "website", "location"];
    const updates = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const email = event.requestContext.authorizer.jwt.claims.email;
    const username = event.requestContext.authorizer.jwt.claims['cognito:username'];

    const userProfile = {
      userId,
      email,
      username,
      role: existingProfile?.role || "user",
      createdAt: existingProfile?.createdAt || Date.now(),
      updatedAt: Date.now(),
      ...updates
    };

    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: userProfile
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(userProfile)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
