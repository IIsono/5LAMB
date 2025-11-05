const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const { postId } = event.pathParameters;
    const createdAt = event.queryStringParameters?.createdAt;
    
    if (!createdAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "createdAt query parameter is required" })
      };
    }
    
    const existing = await docClient.send(new GetCommand({
      TableName: process.env.POSTS_TABLE,
      Key: {
        postId,
        createdAt: parseInt(createdAt)
      }
    }));
    
    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Post not found" })
      };
    }
    
    if (existing.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" })
      };
    }
    
    await docClient.send(new DeleteCommand({
      TableName: process.env.POSTS_TABLE,
      Key: {
        postId,
        createdAt: parseInt(createdAt)
      }
    }));
    
    return {
      statusCode: 204,
      body: ""
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
