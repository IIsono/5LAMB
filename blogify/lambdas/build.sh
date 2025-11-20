#!/bin/bash

functions=(
  "createPost"
  "getPost"
  "listPosts"
  "updatePost"
  "deletePost"
  "uploadMedia"
  "getMedia"
  "createComment"
  "listComments"
  "searchPosts"
  "manageSubscription"
  "notifySubscribers"
  "getUserProfile"
  "updateUserProfile"
  "getPublicProfile"
  "deleteUserAccount"
  "changePassword"
  "registerUser"
  "loginUser"
  "cognitoPreSignup"
)

for func in "${functions[@]}"; do
  echo "Building $func..."
  tempDir="dist/$func"
  mkdir -p "$tempDir"
  cp "$func.js" "$tempDir/"
  if [ -d "utils" ]; then
    cp -r utils "$tempDir/" 2>/dev/null || true
  fi
  zipPath="dist/$func.zip"
  if [ -f "$zipPath" ]; then
    rm "$zipPath"
  fi
  (cd "$tempDir" && zip -r "../$func.zip" .)
  echo "Done $func"
done

echo "All Lambda functions built successfully!"
