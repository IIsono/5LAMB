data "archive_file" "lambda_zip" {
  for_each = toset([
    "createPost",
    "getPost",
    "listPosts",
    "updatePost",
    "deletePost",
    "uploadMedia",
    "getMedia",
    "createComment",
    "listComments",
    "moderateComment",
    "searchPosts",
    "manageSubscription",
    "notifySubscribers",
    "getUserProfile",
    "updateUserProfile",
    "getPublicProfile",
    "deleteUserAccount",
    "changePassword",
    "registerUser",
    "loginUser"
  ])

  type        = "zip"
  source_file = "../lambdas/${each.key}.js"
  output_path = "../lambdas/${each.key}.zip"
}

resource "aws_lambda_function" "createPost" {
  filename         = data.archive_file.lambda_zip["createPost"].output_path
  function_name    = "blogify-createPost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "createPost.handler"
  source_code_hash = data.archive_file.lambda_zip["createPost"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "getPost" {
  filename         = data.archive_file.lambda_zip["getPost"].output_path
  function_name    = "blogify-getPost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getPost.handler"
  source_code_hash = data.archive_file.lambda_zip["getPost"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "listPosts" {
  filename         = data.archive_file.lambda_zip["listPosts"].output_path
  function_name    = "blogify-listPosts"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "listPosts.handler"
  source_code_hash = data.archive_file.lambda_zip["listPosts"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "updatePost" {
  filename         = data.archive_file.lambda_zip["updatePost"].output_path
  function_name    = "blogify-updatePost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "updatePost.handler"
  source_code_hash = data.archive_file.lambda_zip["updatePost"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "deletePost" {
  filename         = data.archive_file.lambda_zip["deletePost"].output_path
  function_name    = "blogify-deletePost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "deletePost.handler"
  source_code_hash = data.archive_file.lambda_zip["deletePost"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "uploadMedia" {
  filename         = data.archive_file.lambda_zip["uploadMedia"].output_path
  function_name    = "blogify-uploadMedia"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "uploadMedia.handler"
  source_code_hash = data.archive_file.lambda_zip["uploadMedia"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      MEDIA_BUCKET = aws_s3_bucket.media.id
      MEDIA_TABLE  = aws_dynamodb_table.media.name
    }
  }
}

resource "aws_lambda_function" "getMedia" {
  filename         = data.archive_file.lambda_zip["getMedia"].output_path
  function_name    = "blogify-getMedia"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getMedia.handler"
  source_code_hash = data.archive_file.lambda_zip["getMedia"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      MEDIA_TABLE = aws_dynamodb_table.media.name
    }
  }
}

resource "aws_lambda_function" "createComment" {
  filename         = data.archive_file.lambda_zip["createComment"].output_path
  function_name    = "blogify-createComment"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "createComment.handler"
  source_code_hash = data.archive_file.lambda_zip["createComment"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COMMENTS_TABLE = aws_dynamodb_table.comments.name
    }
  }
}

resource "aws_lambda_function" "listComments" {
  filename         = data.archive_file.lambda_zip["listComments"].output_path
  function_name    = "blogify-listComments"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "listComments.handler"
  source_code_hash = data.archive_file.lambda_zip["listComments"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COMMENTS_TABLE = aws_dynamodb_table.comments.name
      USERS_TABLE    = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "moderateComment" {
  filename         = data.archive_file.lambda_zip["moderateComment"].output_path
  function_name    = "blogify-moderateComment"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "moderateComment.handler"
  source_code_hash = data.archive_file.lambda_zip["moderateComment"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COMMENTS_TABLE = aws_dynamodb_table.comments.name
    }
  }
}

resource "aws_lambda_function" "searchPosts" {
  filename         = data.archive_file.lambda_zip["searchPosts"].output_path
  function_name    = "blogify-searchPosts"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "searchPosts.handler"
  source_code_hash = data.archive_file.lambda_zip["searchPosts"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "manageSubscription" {
  filename         = data.archive_file.lambda_zip["manageSubscription"].output_path
  function_name    = "blogify-manageSubscription"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "manageSubscription.handler"
  source_code_hash = data.archive_file.lambda_zip["manageSubscription"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      SUBSCRIPTIONS_TABLE = aws_dynamodb_table.subscriptions.name
    }
  }
}

resource "aws_lambda_function" "notifySubscribers" {
  filename         = data.archive_file.lambda_zip["notifySubscribers"].output_path
  function_name    = "blogify-notifySubscribers"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "notifySubscribers.handler"
  source_code_hash = data.archive_file.lambda_zip["notifySubscribers"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      SUBSCRIPTIONS_TABLE = aws_dynamodb_table.subscriptions.name
      SNS_TOPIC_ARN       = aws_sns_topic.post_notifications.arn
      BLOG_URL            = "https://yourblog.com"
    }
  }
}

resource "aws_lambda_event_source_mapping" "posts_stream" {
  event_source_arn  = aws_dynamodb_table.posts.stream_arn
  function_name     = aws_lambda_function.notifySubscribers.arn
  starting_position = "LATEST"
  batch_size        = 10

  depends_on = [
    aws_iam_role_policy_attachment.lambda_dynamodb_s3
  ]
}

resource "aws_lambda_function" "getUserProfile" {
  filename         = data.archive_file.lambda_zip["getUserProfile"].output_path
  function_name    = "blogify-getUserProfile"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getUserProfile.handler"
  source_code_hash = data.archive_file.lambda_zip["getUserProfile"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "updateUserProfile" {
  filename         = data.archive_file.lambda_zip["updateUserProfile"].output_path
  function_name    = "blogify-updateUserProfile"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "updateUserProfile.handler"
  source_code_hash = data.archive_file.lambda_zip["updateUserProfile"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "getPublicProfile" {
  filename         = data.archive_file.lambda_zip["getPublicProfile"].output_path
  function_name    = "blogify-getPublicProfile"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getPublicProfile.handler"
  source_code_hash = data.archive_file.lambda_zip["getPublicProfile"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "deleteUserAccount" {
  filename         = data.archive_file.lambda_zip["deleteUserAccount"].output_path
  function_name    = "blogify-deleteUserAccount"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "deleteUserAccount.handler"
  source_code_hash = data.archive_file.lambda_zip["deleteUserAccount"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "changePassword" {
  filename         = data.archive_file.lambda_zip["changePassword"].output_path
  function_name    = "blogify-changePassword"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "changePassword.handler"
  source_code_hash = data.archive_file.lambda_zip["changePassword"].output_base64sha256
  runtime         = "nodejs20.x"
}

resource "aws_lambda_function" "registerUser" {
  filename         = data.archive_file.lambda_zip["registerUser"].output_path
  function_name    = "blogify-registerUser"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "registerUser.handler"
  source_code_hash = data.archive_file.lambda_zip["registerUser"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE           = aws_dynamodb_table.users.name
      COGNITO_USER_POOL_ID  = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID     = aws_cognito_user_pool_client.main.id
      AUTO_CONFIRM_USERS    = "true"  # Mode développement - auto-confirme les utilisateurs
    }
  }
}

resource "aws_lambda_function" "loginUser" {
  filename         = data.archive_file.lambda_zip["loginUser"].output_path
  function_name    = "blogify-loginUser"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "loginUser.handler"
  source_code_hash = data.archive_file.lambda_zip["loginUser"].output_base64sha256
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.main.id
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      AUTO_CONFIRM_USERS   = "true"  # Mode développement
    }
  }
}

locals {
  lambda_functions = {
    "createPost"          = aws_lambda_function.createPost.function_name
    "getPost"             = aws_lambda_function.getPost.function_name
    "listPosts"           = aws_lambda_function.listPosts.function_name
    "updatePost"          = aws_lambda_function.updatePost.function_name
    "deletePost"          = aws_lambda_function.deletePost.function_name
    "uploadMedia"         = aws_lambda_function.uploadMedia.function_name
    "getMedia"            = aws_lambda_function.getMedia.function_name
    "createComment"       = aws_lambda_function.createComment.function_name
    "listComments"        = aws_lambda_function.listComments.function_name
    "moderateComment"     = aws_lambda_function.moderateComment.function_name
    "searchPosts"         = aws_lambda_function.searchPosts.function_name
    "manageSubscription"  = aws_lambda_function.manageSubscription.function_name
    "getUserProfile"      = aws_lambda_function.getUserProfile.function_name
    "updateUserProfile"   = aws_lambda_function.updateUserProfile.function_name
    "getPublicProfile"    = aws_lambda_function.getPublicProfile.function_name
    "deleteUserAccount"   = aws_lambda_function.deleteUserAccount.function_name
    "changePassword"      = aws_lambda_function.changePassword.function_name
    "registerUser"        = aws_lambda_function.registerUser.function_name
    "loginUser"           = aws_lambda_function.loginUser.function_name
  }
}

resource "aws_lambda_permission" "api_gateway" {
  for_each = local.lambda_functions

  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
