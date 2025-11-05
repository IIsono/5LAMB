const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { postId } = event.pathParameters;
    const createdAt = event.queryStringParameters?.createdAt;
    
    if (!createdAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "createdAt query parameter is required" })
      };
    }
    
    const result = await docClient.send(new GetCommand({
      TableName: process.env.POSTS_TABLE,
      Key: {
        postId,
        createdAt: parseInt(createdAt)
      }
    }));
    
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Post not found" })
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
