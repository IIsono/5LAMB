const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters?.q;
    const tags = event.queryStringParameters?.tags;
    const status = event.queryStringParameters?.status || "published";
    const limit = parseInt(event.queryStringParameters?.limit || "20");
    
    if (!query && !tags) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Query parameter 'q' or 'tags' is required" })
      };
    }
    
    let filterExpression = "#status = :status";
    const expressionAttributeNames = {
      "#status": "status"
    };
    const expressionAttributeValues = {
      ":status": status
    };
    
    if (query) {
      filterExpression += " AND (contains(#title, :query) OR contains(#content, :query))";
      expressionAttributeNames["#title"] = "title";
      expressionAttributeNames["#content"] = "content";
      expressionAttributeValues[":query"] = query;
    }
    
    if (tags) {
      const tagList = tags.split(",");
      filterExpression += " AND (";
      tagList.forEach((tag, index) => {
        if (index > 0) filterExpression += " OR ";
        filterExpression += `contains(#tags, :tag${index})`;
        expressionAttributeValues[`:tag${index}`] = tag.trim();
      });
      filterExpression += ")";
      expressionAttributeNames["#tags"] = "tags";
    }
    
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.POSTS_TABLE,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit
    }));
    
    const sortedItems = result.Items.sort((a, b) => b.createdAt - a.createdAt);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: sortedItems,
        count: result.Count,
        query: query || null,
        tags: tags || null
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
