const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters?.q;
    const tags = event.queryStringParameters?.tags;
    const status = event.queryStringParameters?.status;
    const limit = parseInt(event.queryStringParameters?.limit || "20");

    if (!query && !tags) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Query parameter 'q' or 'tags' is required" })
      };
    }
    
    let filterExpression = "";
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Filtre par statut si spécifié
    if (status) {
      filterExpression = "#status = :status";
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }

    if (query) {
      if (filterExpression) filterExpression += " AND ";
      filterExpression += "(contains(#title, :query) OR contains(#content, :query))";
      expressionAttributeNames["#title"] = "title";
      expressionAttributeNames["#content"] = "content";
      expressionAttributeValues[":query"] = query;
    }

    if (tags) {
      const tagList = tags.split(",").map(t => t.trim());
      if (filterExpression) filterExpression += " AND ";

      // Rechercher si au moins un tag correspond
      const tagConditions = tagList.map((tag, index) => {
        expressionAttributeValues[`:tag${index}`] = tag;
        return `contains(tags, :tag${index})`;
      });

      filterExpression += `(${tagConditions.join(" OR ")})`;
    }
    
    const scanParams = {
      TableName: process.env.POSTS_TABLE,
      Limit: limit
    };

    if (filterExpression) {
      scanParams.FilterExpression = filterExpression;
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await docClient.send(new ScanCommand(scanParams));

    const sortedItems = result.Items.sort((a, b) => b.createdAt - a.createdAt);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        items: sortedItems,
        count: result.Count,
        query: query || null,
        tags: tags || null,
        status: status || null
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};
