const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || "anonymous";
    const { postId } = event.pathParameters;
    const body = JSON.parse(event.body);
    
    const { content, authorName, authorEmail } = body;
    
    if (!content || content.length < 3) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Content is required (min 3 characters)" })
      };
    }
    
    const commentId = randomUUID();
    const timestamp = Date.now();
    
    const comment = {
      commentId,
      postId,
      userId,
      content,
      authorName: authorName || "Anonymous",
      authorEmail: authorEmail || null,
      status: "approved",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.COMMENTS_TABLE,
      Item: comment
    }));
    
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(comment)
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
