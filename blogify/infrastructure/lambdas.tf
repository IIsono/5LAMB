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
    "notifySubscribers"
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
}

resource "aws_lambda_permission" "api_gateway" {
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
    "manageSubscription"
  ])

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
