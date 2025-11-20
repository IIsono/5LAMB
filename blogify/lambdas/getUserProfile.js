const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    console.log("RequestContext:", JSON.stringify(event.requestContext, null, 2));

    const claims = event.requestContext.authorizer?.jwt?.claims || event.requestContext.authorizer?.claims || {};
    const userId = claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Unauthorized - No user ID in token" })
      };
    }

    const result = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!result.Item) {
      const email = event.requestContext.authorizer.jwt.claims.email;
      const username = event.requestContext.authorizer.jwt.claims['cognito:username'];

      return {
        statusCode: 200,
        headers: corsHeaders,
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
      headers: corsHeaders,
      body: JSON.stringify(result.Item)
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
