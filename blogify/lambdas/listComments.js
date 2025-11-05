const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { postId } = event.pathParameters;
    const status = event.queryStringParameters?.status || "approved";
    const limit = parseInt(event.queryStringParameters?.limit || "50");
    
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.COMMENTS_TABLE,
      IndexName: "postId-createdAt-index",
      KeyConditionExpression: "postId = :postId",
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":postId": postId,
        ":status": status
      },
      Limit: limit,
      ScanIndexForward: false
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items,
        count: result.Count
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
