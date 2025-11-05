#!/bin/bash

if [ $# -lt 3 ]; then
    echo "Usage: $0 <user_pool_id> <email> <password> [role]"
    echo "Roles: admin, editor, guest_author"
    exit 1
fi

USER_POOL_ID=$1
EMAIL=$2
PASSWORD=$3
ROLE=${4:-editor}

echo "Creating user: $EMAIL with role: $ROLE"

aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --user-attributes Name=email,Value=$EMAIL Name=email_verified,Value=true Name=custom:role,Value=$ROLE \
    --temporary-password TempPass123! \
    --message-action SUPPRESS

echo "Setting permanent password..."

aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --password $PASSWORD \
    --permanent

echo "User created successfully!"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo "Role: $ROLE"
