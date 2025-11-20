const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function getAuthorInfo(userId) {
  if (userId === "anonymous") {
    return {
      userId: "anonymous",
      username: "Anonymous",
      displayName: "Anonymous User",
      avatar: ""
    };
  }

  try {
    const result = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!result.Item) {
      return {
        userId,
        username: "Unknown",
        displayName: "Unknown User",
        avatar: ""
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
      displayName: "Unknown User",
      avatar: ""
    };
  }
}

exports.handler = async (event) => {
  try {
    const { postId } = event.pathParameters;
    const limit = parseInt(event.queryStringParameters?.limit || "50");

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.COMMENTS_TABLE,
      IndexName: "postId-createdAt-index",
      KeyConditionExpression: "postId = :postId",
      ExpressionAttributeValues: {
        ":postId": postId
      },
      Limit: limit,
      ScanIndexForward: false
    }));

    const enrichedComments = await Promise.all(
      result.Items.map(async (comment) => {
        const author = await getAuthorInfo(comment.userId);
        return {
          ...comment,
          author
        };
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        items: enrichedComments,
        count: result.Count
      })
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
