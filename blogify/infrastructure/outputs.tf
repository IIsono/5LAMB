output "api_endpoint" {
  value = aws_apigatewayv2_stage.default.invoke_url
}

output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.media.id
}
