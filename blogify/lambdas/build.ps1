$functions = @('createPost', 'getPost', 'listPosts', 'updatePost', 'deletePost', 'uploadMedia', 'getMedia', 'createComment', 'listComments', 'searchPosts', 'manageSubscription', 'notifySubscribers', 'getUserProfile', 'updateUserProfile', 'getPublicProfile', 'deleteUserAccount', 'changePassword', 'registerUser', 'loginUser', 'cognitoPreSignup')

foreach ($func in $functions) {
    Write-Host "Building $func..."
    $tempDir = "dist\$func"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    Copy-Item "$func.js" "$tempDir\"
    if (Test-Path "utils") {
        Copy-Item -Recurse "utils" "$tempDir\" -ErrorAction SilentlyContinue
    }
    $zipPath = "dist\$func.zip"
    if (Test-Path $zipPath) {
        Remove-Item $zipPath
    }
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath
    Write-Host "Done $func"
}

Write-Host "All Lambda functions built successfully!"
