"""
AWS Cognito authentication provider
"""

import logging
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError

from ..conf import auth_settings
from .base import AuthenticationError, AuthProvider

logger = logging.getLogger(__name__)


class CognitoAuthProvider(AuthProvider):
    """
    AWS Cognito User Pool authentication provider
    """

    def __init__(self):
        self.region = auth_settings.COGNITO_REGION
        self.client_id = auth_settings.COGNITO_CLIENT_ID

        if not self.client_id:
            raise ValueError("COGNITO_CLIENT_ID is required for CognitoAuthProvider")

        self.client = boto3.client("cognito-idp", region_name=self.region)

    def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """
        Authenticate user with AWS Cognito
        """
        email = credentials.get("email")
        password = credentials.get("password")

        if not email or not password:
            raise AuthenticationError("Email and password are required")

        try:
            # InitiateAuth with Cognito
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": password,
                },
            )

            # Extract tokens from response
            auth_result = response["AuthenticationResult"]
            access_token = auth_result["AccessToken"]

            # Get user information
            user_info = self.get_user_info(access_token)

            logger.info(f"Successful authentication for user: {email}")

            return {
                "access_token": access_token,
                "user": user_info,
                "message": "Login successful",
                "id_token": auth_result.get("IdToken"),
                "refresh_token": auth_result.get("RefreshToken"),
            }

        except ClientError as e:
            error_code = e.response["Error"]["Code"]

            if error_code == "NotAuthorizedException":
                logger.warning(
                    f"Authentication failed for user: {email} - Invalid credentials"
                )
                raise AuthenticationError(
                    "Invalid email or password",
                    "The email or password you entered is incorrect",
                )
            elif error_code == "UserNotConfirmedException":
                logger.warning(
                    f"Authentication failed for user: {email} - User not confirmed"
                )
                raise AuthenticationError(
                    "Email not verified",
                    "Please verify your email address before logging in",
                )
            elif error_code == "UserNotFoundException":
                logger.warning(
                    f"Authentication failed for user: {email} - User not found"
                )
                raise AuthenticationError(
                    "User not found", "No account found with this email address"
                )
            else:
                logger.error(f"Cognito authentication error: {error_code} - {str(e)}")
                raise AuthenticationError(
                    "Authentication failed", "An error occurred during authentication"
                )

        except Exception as e:
            logger.error(f"Unexpected authentication error: {str(e)}")
            raise AuthenticationError(
                "Authentication failed", "An unexpected error occurred"
            )

    def get_user_info(self, token: str) -> Dict[str, Any]:
        """
        Get user information from Cognito access token
        """
        try:
            user_response = self.client.get_user(AccessToken=token)

            # Extract user attributes
            user_attributes = {
                attr["Name"]: attr["Value"] for attr in user_response["UserAttributes"]
            }

            return {
                "sub": user_attributes.get("sub"),
                "email": user_attributes.get("email"),
                "email_verified": user_attributes.get("email_verified") == "true",
                "given_name": user_attributes.get("given_name"),
                "family_name": user_attributes.get("family_name"),
            }

        except ClientError as e:
            logger.error(f"Failed to get user info: {str(e)}")
            raise AuthenticationError(
                "Failed to get user information", "Invalid or expired access token"
            )

    def validate_credentials(self, credentials: Dict[str, Any]) -> bool:
        """
        Validate credentials for Cognito authentication
        """
        email = credentials.get("email", "").strip()
        password = credentials.get("password", "")

        if not email or not password:
            return False

        # Basic email format validation
        if "@" not in email or "." not in email:
            return False

        return True

    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using Cognito refresh token
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow="REFRESH_TOKEN_AUTH",
                AuthParameters={
                    "REFRESH_TOKEN": refresh_token,
                },
            )

            auth_result = response["AuthenticationResult"]

            return {
                "access_token": auth_result["AccessToken"],
                "id_token": auth_result.get("IdToken"),
                "token_type": auth_result.get("TokenType", "Bearer"),
                "expires_in": auth_result.get("ExpiresIn"),
            }

        except ClientError as e:
            logger.error(f"Token refresh failed: {str(e)}")
            raise AuthenticationError(
                "Token refresh failed", "Invalid or expired refresh token"
            )
