const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const { mediaId } = event.pathParameters;
    
    const result = await docClient.send(new GetCommand({
      TableName: process.env.MEDIA_TABLE,
      Key: { mediaId }
    }));
    
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Media not found" })
      };
    }
    
    const command = new GetObjectCommand({
      Bucket: result.Item.s3Bucket,
      Key: result.Item.s3Key
    });
    
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ...result.Item,
        downloadUrl
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
