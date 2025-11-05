#!/bin/bash

if [ $# -lt 3 ]; then
    echo "Usage: $0 <client_id> <email> <password>"
    exit 1
fi

CLIENT_ID=$1
EMAIL=$2
PASSWORD=$3

echo "Authenticating user: $EMAIL"

RESPONSE=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=$EMAIL,PASSWORD=$PASSWORD \
    --query 'AuthenticationResult.IdToken' \
    --output text)

if [ $? -eq 0 ]; then
    echo ""
    echo "JWT Token:"
    echo $RESPONSE
    echo ""
    echo "Use this token in Authorization header:"
    echo "Authorization: Bearer $RESPONSE"
else
    echo "Authentication failed!"
    exit 1
fi
