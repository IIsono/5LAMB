resource "aws_apigatewayv2_integration" "createPost" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.createPost.invoke_arn
}

resource "aws_apigatewayv2_route" "createPost" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /posts"
  target             = "integrations/${aws_apigatewayv2_integration.createPost.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "getPost" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.getPost.invoke_arn
}

resource "aws_apigatewayv2_route" "getPost" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /posts/{postId}"
  target    = "integrations/${aws_apigatewayv2_integration.getPost.id}"
}

resource "aws_apigatewayv2_integration" "listPosts" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.listPosts.invoke_arn
}

resource "aws_apigatewayv2_route" "listPosts" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /posts"
  target    = "integrations/${aws_apigatewayv2_integration.listPosts.id}"
}

resource "aws_apigatewayv2_integration" "updatePost" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.updatePost.invoke_arn
}

resource "aws_apigatewayv2_route" "updatePost" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /posts/{postId}"
  target             = "integrations/${aws_apigatewayv2_integration.updatePost.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "deletePost" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.deletePost.invoke_arn
}

resource "aws_apigatewayv2_route" "deletePost" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /posts/{postId}"
  target             = "integrations/${aws_apigatewayv2_integration.deletePost.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "uploadMedia" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.uploadMedia.invoke_arn
}

resource "aws_apigatewayv2_route" "uploadMedia" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /media"
  target             = "integrations/${aws_apigatewayv2_integration.uploadMedia.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "getMedia" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.getMedia.invoke_arn
}

resource "aws_apigatewayv2_route" "getMedia" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /media/{mediaId}"
  target    = "integrations/${aws_apigatewayv2_integration.getMedia.id}"
}

resource "aws_apigatewayv2_integration" "createComment" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.createComment.invoke_arn
}

resource "aws_apigatewayv2_route" "createComment" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /posts/{postId}/comments"
  target             = "integrations/${aws_apigatewayv2_integration.createComment.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "listComments" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.listComments.invoke_arn
}

resource "aws_apigatewayv2_route" "listComments" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /posts/{postId}/comments"
  target    = "integrations/${aws_apigatewayv2_integration.listComments.id}"
}

resource "aws_apigatewayv2_integration" "searchPosts" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.searchPosts.invoke_arn
}

resource "aws_apigatewayv2_route" "searchPosts" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /posts/search"
  target    = "integrations/${aws_apigatewayv2_integration.searchPosts.id}"
}

resource "aws_apigatewayv2_integration" "manageSubscription" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.manageSubscription.invoke_arn
}

resource "aws_apigatewayv2_route" "manageSubscription" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /subscriptions/{action}"
  target             = "integrations/${aws_apigatewayv2_integration.manageSubscription.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "getSubscription" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /subscriptions/{action}"
  target             = "integrations/${aws_apigatewayv2_integration.manageSubscription.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "getUserProfile" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.getUserProfile.invoke_arn
}

resource "aws_apigatewayv2_route" "getUserProfile" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /profile"
  target             = "integrations/${aws_apigatewayv2_integration.getUserProfile.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "updateUserProfile" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.updateUserProfile.invoke_arn
}

resource "aws_apigatewayv2_route" "updateUserProfile" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /profile"
  target             = "integrations/${aws_apigatewayv2_integration.updateUserProfile.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "getPublicProfile" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.getPublicProfile.invoke_arn
}

resource "aws_apigatewayv2_route" "getPublicProfile" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /users/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.getPublicProfile.id}"
}

resource "aws_apigatewayv2_integration" "deleteUserAccount" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.deleteUserAccount.invoke_arn
}

resource "aws_apigatewayv2_route" "deleteUserAccount" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /account"
  target             = "integrations/${aws_apigatewayv2_integration.deleteUserAccount.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "changePassword" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.changePassword.invoke_arn
}

resource "aws_apigatewayv2_route" "changePassword" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /account/change-password"
  target             = "integrations/${aws_apigatewayv2_integration.changePassword.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "registerUser" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.registerUser.invoke_arn
}

resource "aws_apigatewayv2_route" "registerUser" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/register"
  target    = "integrations/${aws_apigatewayv2_integration.registerUser.id}"
}

resource "aws_apigatewayv2_integration" "loginUser" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.loginUser.invoke_arn
}

resource "aws_apigatewayv2_route" "loginUser" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/login"
  target    = "integrations/${aws_apigatewayv2_integration.loginUser.id}"
}
