const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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

    const { postId } = event.pathParameters;

    const existing = await docClient.send(new GetCommand({
      TableName: process.env.POSTS_TABLE,
      Key: { postId }
    }));
    
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Post not found" })
      };
    }

    if (existing.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Forbidden" })
      };
    }
    
    await docClient.send(new DeleteCommand({
      TableName: process.env.POSTS_TABLE,
      Key: { postId }
    }));
    
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
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
