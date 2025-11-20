const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { action } = event.pathParameters;

    const claims = event.requestContext.authorizer?.jwt?.claims || event.requestContext.authorizer?.claims || {};
    const followerId = claims.sub;

    if (!followerId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Authentication required to follow users" })
      };
    }

    if (action === "follow") {
      const body = JSON.parse(event.body);
      const { userId: followedId } = body;

      if (!followedId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "userId is required to follow" })
        };
      }

      if (followerId === followedId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "You cannot follow yourself" })
        };
      }

      const subscription = {
        followerId,
        followedId,
        createdAt: Date.now()
      };

      await docClient.send(new PutCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Item: subscription
      }));

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Successfully followed user",
          followerId,
          followedId
        })
      };
    } else if (action === "unfollow") {
      const body = JSON.parse(event.body);
      const { userId: followedId } = body;

      if (!followedId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "userId is required to unfollow" })
        };
      }

      await docClient.send(new DeleteCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Key: {
          followerId,
          followedId
        }
      }));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Successfully unfollowed user" })
      };
    } else if (action === "following") {
      const result = await docClient.send(new QueryCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        KeyConditionExpression: "followerId = :followerId",
        ExpressionAttributeValues: {
          ":followerId": followerId
        }
      }));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          following: result.Items,
          count: result.Count
        })
      };
    } else if (action === "followers") {
      try {
        console.log("Fetching followers for userId:", followerId);

        const result = await docClient.send(new QueryCommand({
          TableName: process.env.SUBSCRIPTIONS_TABLE,
          IndexName: "followedId-index",
          KeyConditionExpression: "followedId = :followedId",
          ExpressionAttributeValues: {
            ":followedId": followerId
          }
        }));

        console.log("Followers result:", JSON.stringify(result));

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            followers: result.Items || [],
            count: result.Count || 0
          })
        };
      } catch (err) {
        console.error("Error fetching followers:", err);
        throw err;
      }
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Action must be 'follow', 'unfollow', 'following', or 'followers'" })
      };
    }
  } catch (error) {
    console.error("Error in manageSubscription:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
        errorType: error.name
      })
    };
  }
};
