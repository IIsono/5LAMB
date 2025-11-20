const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function getAuthorInfo(userId) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!result.Item) {
      return {
        userId,
        username: "Unknown",
        displayName: "Unknown User"
      };
    }

    return {
      userId: result.Item.userId,
      username: result.Item.username,
      displayName: result.Item.displayName || result.Item.username,
      avatar: result.Item.avatar || ""
    };
  } catch (error) {
    console.error("Error fetching author info:", error);
    return {
      userId,
      username: "Unknown",
      displayName: "Unknown User"
    };
  }
}

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

      const enrichedPosts = await Promise.all(
        result.Items.map(async (post) => {
          const author = await getAuthorInfo(post.userId);
          return {
            ...post,
            author
          };
        })
      );

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        body: JSON.stringify({
          items: enrichedPosts,
          count: result.Count
        })
      };
    }

    const result = await docClient.send(new QueryCommand(queryParams));

    const enrichedPosts = await Promise.all(
      result.Items.map(async (post) => {
        const author = await getAuthorInfo(post.userId);
        return {
          ...post,
          author
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      },
      body: JSON.stringify({
        items: enrichedPosts,
        count: result.Count
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      },
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
