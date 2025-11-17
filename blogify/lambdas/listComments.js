const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Helper pour récupérer les infos publiques de l'auteur
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

    // Enrichir chaque commentaire avec les infos de l'auteur
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
      body: JSON.stringify({
        items: enrichedComments,
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
