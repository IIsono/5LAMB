const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    const limit = parseInt(event.queryStringParameters?.limit || "20");
    
    let queryParams;
    
    if (userId) {
      queryParams = {
        TableName: process.env.POSTS_TABLE,
        IndexName: "userId-createdAt-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId
        },
        Limit: limit,
        ScanIndexForward: false
      };
    } else {
      queryParams = {
        TableName: process.env.POSTS_TABLE,
        Limit: limit
      };
      
      const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
      const result = await docClient.send(new ScanCommand(queryParams));
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: result.Items,
          count: result.Count
        })
      };
    }
    
    const result = await docClient.send(new QueryCommand(queryParams));
    
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
