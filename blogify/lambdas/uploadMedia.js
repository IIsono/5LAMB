const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  try {
    const claims = event.requestContext.authorizer?.jwt?.claims || event.requestContext.authorizer?.claims || {};
    const userId = claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized - No user ID in token" })
      };
    }

    const body = JSON.parse(event.body);
    
    const { fileName, fileType, fileSize } = body;
    
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "fileName and fileType are required" })
      };
    }
    
    const mediaId = randomUUID();
    const s3Key = `${userId}/${mediaId}/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.MEDIA_BUCKET,
      Key: s3Key,
      ContentType: fileType
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    const media = {
      mediaId,
      userId,
      s3Key,
      s3Bucket: process.env.MEDIA_BUCKET,
      fileType,
      fileSize: fileSize || 0,
      uploadedAt: Date.now()
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.MEDIA_TABLE,
      Item: media
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl,
        mediaId,
        s3Key
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
