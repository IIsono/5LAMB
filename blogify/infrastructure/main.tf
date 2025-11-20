terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_dynamodb_table" "users" {
  name           = "blogify-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Project = "Blogify"
  }
}

resource "aws_dynamodb_table" "posts" {
  name           = "blogify-posts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "postId"

  attribute {
    name = "postId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  global_secondary_index {
    name            = "userId-createdAt-index"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Project = "Blogify"
  }
}

resource "aws_dynamodb_table" "media" {
  name           = "blogify-media"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "mediaId"

  attribute {
    name = "mediaId"
    type = "S"
  }

  tags = {
    Project = "Blogify"
  }
}

resource "aws_dynamodb_table" "comments" {
  name           = "blogify-comments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "commentId"

  attribute {
    name = "commentId"
    type = "S"
  }

  attribute {
    name = "postId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  global_secondary_index {
    name            = "postId-createdAt-index"
    hash_key        = "postId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Lifecycle pour éviter les problèmes lors du destroy
  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Project = "Blogify"
  }
}

resource "aws_dynamodb_table" "subscriptions" {
  name           = "blogify-subscriptions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "followerId"
  range_key      = "followedId"

  attribute {
    name = "followerId"
    type = "S"
  }

  attribute {
    name = "followedId"
    type = "S"
  }

  global_secondary_index {
    name               = "followedId-index"
    hash_key           = "followedId"
    range_key          = "followerId"
    projection_type    = "ALL"
    read_capacity      = 0
    write_capacity     = 0
  }

  tags = {
    Project = "Blogify"
  }
}

resource "aws_s3_bucket" "media" {
  bucket        = "blogify-media-${var.environment}-913826031566"
  force_destroy = true

  tags = {
    Project = "Blogify"
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_cognito_user_pool" "main" {
  name = "blogify-user-pool"

  deletion_protection = "INACTIVE"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # Lambda trigger pour auto-confirmer tous les utilisateurs
  lambda_config {
    pre_sign_up = aws_lambda_function.cognito_pre_signup.arn
  }

  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }

  tags = {
    Project = "Blogify"
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "blogify-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

resource "aws_iam_role" "lambda_exec" {
  name = "blogify-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_exec.name
}

resource "aws_iam_policy" "lambda_dynamodb_s3" {
  name = "blogify-lambda-dynamodb-s3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.posts.arn,
          aws_dynamodb_table.media.arn,
          aws_dynamodb_table.comments.arn,
          aws_dynamodb_table.subscriptions.arn,
          "${aws_dynamodb_table.posts.arn}/index/*",
          "${aws_dynamodb_table.comments.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.media.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.post_notifications.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams"
        ]
        Resource = [
          "${aws_dynamodb_table.posts.arn}/stream/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminConfirmSignUp",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_s3" {
  policy_arn = aws_iam_policy.lambda_dynamodb_s3.arn
  role       = aws_iam_role.lambda_exec.name
}

resource "aws_apigatewayv2_api" "main" {
  name          = "blogify-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.main.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

resource "aws_sns_topic" "post_notifications" {
  name = "blogify-post-notifications"

  tags = {
    Project = "Blogify"
  }
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.post_notifications.arn
  protocol  = "email"
  endpoint  = var.notification_email
}
