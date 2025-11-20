resource "aws_lambda_function" "createPost" {
  filename         = "../lambdas/dist/createPost.zip"
  function_name    = "blogify-createPost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "createPost.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/createPost.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "getPost" {
  filename         = "../lambdas/dist/getPost.zip"
  function_name    = "blogify-getPost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getPost.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/getPost.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "listPosts" {
  filename         = "../lambdas/dist/listPosts.zip"
  function_name    = "blogify-listPosts"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "listPosts.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/listPosts.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "updatePost" {
  filename         = "../lambdas/dist/updatePost.zip"
  function_name    = "blogify-updatePost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "updatePost.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/updatePost.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "deletePost" {
  filename         = "../lambdas/dist/deletePost.zip"
  function_name    = "blogify-deletePost"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "deletePost.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/deletePost.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "uploadMedia" {
  filename         = "../lambdas/dist/uploadMedia.zip"
  function_name    = "blogify-uploadMedia"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "uploadMedia.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/uploadMedia.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      MEDIA_BUCKET = aws_s3_bucket.media.id
      MEDIA_TABLE  = aws_dynamodb_table.media.name
    }
  }
}

resource "aws_lambda_function" "getMedia" {
  filename         = "../lambdas/dist/getMedia.zip"
  function_name    = "blogify-getMedia"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getMedia.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/getMedia.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      MEDIA_TABLE = aws_dynamodb_table.media.name
    }
  }
}

resource "aws_lambda_function" "createComment" {
  filename         = "../lambdas/dist/createComment.zip"
  function_name    = "blogify-createComment"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "createComment.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/createComment.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COMMENTS_TABLE = aws_dynamodb_table.comments.name
    }
  }
}

resource "aws_lambda_function" "listComments" {
  filename         = "../lambdas/dist/listComments.zip"
  function_name    = "blogify-listComments"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "listComments.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/listComments.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COMMENTS_TABLE = aws_dynamodb_table.comments.name
      USERS_TABLE    = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "searchPosts" {
  filename         = "../lambdas/dist/searchPosts.zip"
  function_name    = "blogify-searchPosts"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "searchPosts.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/searchPosts.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      POSTS_TABLE = aws_dynamodb_table.posts.name
    }
  }
}

resource "aws_lambda_function" "manageSubscription" {
  filename         = "../lambdas/dist/manageSubscription.zip"
  function_name    = "blogify-manageSubscription"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "manageSubscription.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/manageSubscription.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      SUBSCRIPTIONS_TABLE = aws_dynamodb_table.subscriptions.name
    }
  }
}

resource "aws_lambda_function" "notifySubscribers" {
  filename         = "../lambdas/dist/notifySubscribers.zip"
  function_name    = "blogify-notifySubscribers"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "notifySubscribers.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/notifySubscribers.zip")
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
  filename         = "../lambdas/dist/getUserProfile.zip"
  function_name    = "blogify-getUserProfile"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getUserProfile.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/getUserProfile.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "updateUserProfile" {
  filename         = "../lambdas/dist/updateUserProfile.zip"
  function_name    = "blogify-updateUserProfile"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "updateUserProfile.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/updateUserProfile.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE          = aws_dynamodb_table.users.name
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
    }
  }
}

resource "aws_lambda_function" "getPublicProfile" {
  filename         = "../lambdas/dist/getPublicProfile.zip"
  function_name    = "blogify-getPublicProfile"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "getPublicProfile.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/getPublicProfile.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "deleteUserAccount" {
  filename         = "../lambdas/dist/deleteUserAccount.zip"
  function_name    = "blogify-deleteUserAccount"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "deleteUserAccount.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/deleteUserAccount.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_lambda_function" "changePassword" {
  filename         = "../lambdas/dist/changePassword.zip"
  function_name    = "blogify-changePassword"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "changePassword.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/changePassword.zip")
  runtime         = "nodejs20.x"
}

resource "aws_lambda_function" "registerUser" {
  filename         = "../lambdas/dist/registerUser.zip"
  function_name    = "blogify-registerUser"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "registerUser.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/registerUser.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      USERS_TABLE          = aws_dynamodb_table.users.name
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.main.id
      AUTO_CONFIRM_USERS   = "true"
    }
  }
}

resource "aws_lambda_function" "loginUser" {
  filename         = "../lambdas/dist/loginUser.zip"
  function_name    = "blogify-loginUser"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "loginUser.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/loginUser.zip")
  runtime         = "nodejs20.x"

  environment {
    variables = {
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.main.id
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      AUTO_CONFIRM_USERS   = "true"
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

# Lambda trigger Cognito
resource "aws_lambda_function" "cognito_pre_signup" {
  filename         = "../lambdas/dist/cognitoPreSignup.zip"
  function_name    = "blogify-cognito-pre-signup"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "cognitoPreSignup.handler"
  source_code_hash = filebase64sha256("../lambdas/dist/cognitoPreSignup.zip")
  runtime         = "nodejs20.x"
}

resource "aws_lambda_permission" "cognito_pre_signup" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
