const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    const result = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!result.Item) {
      // Créer un profil basique si l'utilisateur n'existe pas encore
      const email = event.requestContext.authorizer.jwt.claims.email;
      const username = event.requestContext.authorizer.jwt.claims['cognito:username'];

      return {
        statusCode: 200,
        body: JSON.stringify({
          userId,
          email,
          username,
          displayName: username,
          role: "user",
          bio: "",
          avatar: "",
          createdAt: Date.now()
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
