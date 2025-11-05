const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
        const newImage = record.dynamodb.NewImage;
        
        if (newImage.status?.S === "published") {
          const postTitle = newImage.title?.S;
          const postId = newImage.postId?.S;
          
          const subscribers = await docClient.send(new ScanCommand({
            TableName: process.env.SUBSCRIPTIONS_TABLE,
            FilterExpression: "#status = :status",
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":status": "active"
            }
          }));
          
          const message = `New post published: "${postTitle}"\n\nRead it at: ${process.env.BLOG_URL}/posts/${postId}`;
          
          for (const subscriber of subscribers.Items) {
            try {
              await snsClient.send(new PublishCommand({
                TopicArn: process.env.SNS_TOPIC_ARN,
                Message: message,
                Subject: `New Post: ${postTitle}`,
                MessageAttributes: {
                  email: {
                    DataType: "String",
                    StringValue: subscriber.email
                  }
                }
              }));
            } catch (error) {
              console.error(`Failed to notify ${subscriber.email}:`, error);
            }
          }
          
          console.log(`Notified ${subscribers.Items.length} subscribers about new post: ${postTitle}`);
        }
      }
    }
    
    return { statusCode: 200, body: "Notifications sent" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "Error sending notifications" };
  }
};
