const { CognitoIdentityProviderClient, ChangePasswordCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { previousPassword, proposedPassword } = body;

    if (!previousPassword || !proposedPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Previous and proposed passwords are required" })
      };
    }

    if (proposedPassword.length < 8) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Password must be at least 8 characters long" })
      };
    }

    const accessToken = event.headers.authorization?.split(' ')[1] || event.headers.Authorization?.split(' ')[1];

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Access token required" })
      };
    }

    await client.send(new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Password changed successfully" })
    };
  } catch (error) {
    console.error(error);

    if (error.name === "NotAuthorizedException") {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Incorrect previous password" })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to change password",
        error: error.message
      })
    };
  }
};
