const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
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
    const body = JSON.parse(event.body);

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
    
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    const allowedFields = ["title", "content", "status", "tags", "mediaUrls"];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field];
      }
    });
    
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = Date.now();
    
    if (body.status === "published" && existing.Item.status !== "published") {
      updateExpressions.push("#publishedAt = :publishedAt");
      expressionAttributeNames["#publishedAt"] = "publishedAt";
      expressionAttributeValues[":publishedAt"] = Date.now();
    }
    
    const result = await docClient.send(new UpdateCommand({
      TableName: process.env.POSTS_TABLE,
      Key: { postId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }));
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Attributes)
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
