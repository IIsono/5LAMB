const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { action } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { email } = body;

    // Récupérer userId si authentifié
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub || null;

    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Valid email is required" })
      };
    }

    if (action === "subscribe") {
      const subscriptionId = randomUUID();
      const subscription = {
        subscriptionId,
        email,
        userId,  // Lier au compte utilisateur si authentifié
        status: "active",
        createdAt: Date.now(),
        preferences: {
          newPosts: true,
          comments: false
        }
      };

      await docClient.send(new PutCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Item: subscription
      }));

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Successfully subscribed",
          subscriptionId,
          isLinkedToAccount: userId !== null
        })
      };
    } else if (action === "unsubscribe") {
      const { subscriptionId } = body;

      if (!subscriptionId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "subscriptionId is required" })
        };
      }

      await docClient.send(new DeleteCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Key: { subscriptionId }
      }));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Successfully unsubscribed" })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Action must be 'subscribe' or 'unsubscribe'" })
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
