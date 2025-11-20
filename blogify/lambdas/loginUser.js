const { CognitoIdentityProviderClient, InitiateAuthCommand, AdminConfirmSignUpCommand, AdminGetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { corsHeaders } = require("./utils/corsHeaders");

const client = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { username, email, password } = body;

    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Username/email and password are required"
        })
      };
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: loginIdentifier,
        PASSWORD: password
      }
    });

    const response = await client.send(command);

    if (response.ChallengeName) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Additional authentication required",
          challengeName: response.ChallengeName,
          session: response.Session,
          challengeParameters: response.ChallengeParameters
        })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Login successful",
        token: response.AuthenticationResult.IdToken
      })
    };

  } catch (error) {
    console.error("Login error:", error);

    if (error.name === "NotAuthorizedException") {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid username or password"
        })
      };
    }

    if (error.name === "UserNotConfirmedException") {
      if (process.env.AUTO_CONFIRM_USERS === "true") {
        try {
          await client.send(new AdminConfirmSignUpCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: loginIdentifier
          }));

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
            headers: corsHeaders,
            body: JSON.stringify({
              message: "Login successful (account auto-confirmed)",
              token: retryResponse.AuthenticationResult.IdToken
            })
          };
        } catch (confirmError) {
          console.error("Auto-confirm failed:", confirmError);
        }
      }

      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "User account is not confirmed. Please verify your email."
        })
      };
    }

    if (error.name === "UserNotFoundException") {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "User not found"
        })
      };
    }

    if (error.name === "PasswordResetRequiredException") {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Password reset required"
        })
      };
    }

    if (error.name === "TooManyRequestsException") {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Too many login attempts. Please try again later."
        })
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Login failed",
        error: error.message
      })
    };
  }
};
