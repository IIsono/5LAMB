const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const role = event.requestContext.authorizer.jwt.claims["custom:role"];
    
    if (role !== "admin" && role !== "editor") {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden: admin or editor role required" })
      };
    }
    
    const { commentId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { status } = body;
    
    if (!["approved", "rejected"].includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Status must be 'approved' or 'rejected'" })
      };
    }
    
    const existing = await docClient.send(new GetCommand({
      TableName: process.env.COMMENTS_TABLE,
      Key: { commentId }
    }));
    
    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Comment not found" })
      };
    }
    
    const result = await docClient.send(new UpdateCommand({
      TableName: process.env.COMMENTS_TABLE,
      Key: { commentId },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt"
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": Date.now()
      },
      ReturnValues: "ALL_NEW"
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
