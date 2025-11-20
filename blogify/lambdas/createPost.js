const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
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

    const body = JSON.parse(event.body);
    
    const { title, content, status = "draft", tags = [] } = body;
    
    if (!title || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Title and content are required" })
      };
    }
    
    const postId = randomUUID();
    const timestamp = Date.now();
    
    const post = {
      postId,
      userId,
      title,
      content,
      status,
      tags,
      mediaUrls: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: status === "published" ? timestamp : null
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.POSTS_TABLE,
      Item: post
    }));
    
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(post)
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
