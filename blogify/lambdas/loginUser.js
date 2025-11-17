const { CognitoIdentityProviderClient, InitiateAuthCommand, AdminConfirmSignUpCommand, AdminGetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { username, email, password } = body;

    // Accepter username OU email
    const loginIdentifier = username || email;

    // Validation
    if (!loginIdentifier || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Username/email and password are required"
        })
      };
    }

    // Authentification avec Cognito
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: loginIdentifier,
        PASSWORD: password
      }
    });

    const response = await client.send(command);

    // Vérifier si un challenge est requis
    if (response.ChallengeName) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Additional authentication required",
          challengeName: response.ChallengeName,
          session: response.Session,
          challengeParameters: response.ChallengeParameters
        })
      };
    }

    // Succès - retourner les tokens
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        authToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
        expiresIn: response.AuthenticationResult.ExpiresIn,
        tokenType: response.AuthenticationResult.TokenType
      })
    };

  } catch (error) {
    console.error("Login error:", error);

    // Erreurs spécifiques de Cognito
    if (error.name === "NotAuthorizedException") {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Invalid username or password"
        })
      };
    }

    if (error.name === "UserNotConfirmedException") {
      // Si AUTO_CONFIRM est activé, confirmer automatiquement l'utilisateur
      if (process.env.AUTO_CONFIRM_USERS === "true") {
        try {
          await client.send(new AdminConfirmSignUpCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: loginIdentifier
          }));

          // Réessayer la connexion après confirmation
          const retryCommand = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
              USERNAME: loginIdentifier,
              PASSWORD: password
            }
          });

          const retryResponse = await client.send(retryCommand);

          return {
            statusCode: 200,
            body: JSON.stringify({
              message: "Login successful (account auto-confirmed)",
              authToken: retryResponse.AuthenticationResult.IdToken,
              accessToken: retryResponse.AuthenticationResult.AccessToken,
              refreshToken: retryResponse.AuthenticationResult.RefreshToken,
              expiresIn: retryResponse.AuthenticationResult.ExpiresIn,
              tokenType: retryResponse.AuthenticationResult.TokenType
            })
          };
        } catch (confirmError) {
          console.error("Auto-confirm failed:", confirmError);
        }
      }

      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "User account is not confirmed. Please verify your email."
        })
      };
    }

    if (error.name === "UserNotFoundException") {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found"
        })
      };
    }

    if (error.name === "PasswordResetRequiredException") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Password reset required"
        })
      };
    }

    if (error.name === "TooManyRequestsException") {
      return {
        statusCode: 429,
        body: JSON.stringify({
          message: "Too many login attempts. Please try again later."
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Login failed",
        error: error.message
      })
    };
  }
};
