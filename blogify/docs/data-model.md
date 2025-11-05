# Modèle de données DynamoDB

## Table: Users
- PK: userId (String)
- Attributes:
  - email (String)
  - username (String)
  - role (String): admin | editor | guest_author
  - createdAt (Number)
  - updatedAt (Number)

## Table: Posts
- PK: postId (String)
- SK: createdAt (Number)
- GSI1: userId-createdAt-index
- Attributes:
  - userId (String)
  - title (String)
  - content (String)
  - status (String): draft | published | archived
  - tags (List)
  - mediaUrls (List)
  - publishedAt (Number)
  - updatedAt (Number)

## Table: Media
- PK: mediaId (String)
- Attributes:
  - userId (String)
  - s3Key (String)
  - s3Bucket (String)
  - fileType (String)
  - fileSize (Number)
  - uploadedAt (Number)

## Table: Comments
- PK: commentId (String)
- GSI1: postId-createdAt-index
- Attributes:
  - postId (String)
  - userId (String)
  - content (String)
  - authorName (String)
  - authorEmail (String)
  - status (String): pending | approved | rejected
  - createdAt (Number)
  - updatedAt (Number)

## Table: Subscriptions
- PK: subscriptionId (String)
- Attributes:
  - email (String)
  - status (String): active | inactive
  - createdAt (Number)
