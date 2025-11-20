const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { postId } = event.pathParameters;

    const result = await docClient.send(new GetCommand({
      TableName: process.env.POSTS_TABLE,
      Key: { postId }
    }));
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Post not found" })
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
