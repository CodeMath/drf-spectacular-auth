"""
Authentication backend for DRF Spectacular Auth
"""

import logging
from typing import Optional

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.http import HttpRequest

from .conf import auth_settings
from .providers.cognito import CognitoAuthProvider

logger = logging.getLogger(__name__)


class SpectacularAuthBackend(BaseBackend):
    """
    Custom authentication backend for DRF Spectacular Auth
    Similar to django-auth-adfs pattern but for Cognito
    """

    def authenticate(
        self, request: HttpRequest, token: str = None, **kwargs
    ) -> Optional:
        """
        Authenticate user with Cognito JWT token
        """
        if not token:
            return None

        try:
            provider = CognitoAuthProvider()
            user_info = provider.verify_token(token)

            if user_info:
                return self._get_or_create_user(user_info)

        except Exception as e:
            logger.error(f"Authentication failed: {e}")

        return None

    def get_user(self, user_id):
        """
        Get user by ID - required by Django auth backend interface
        """
        try:
            User = get_user_model()
            return User.objects.get(pk=user_id)
        except Exception:
            return None

    def _get_or_create_user(self, user_info: dict):
        """
        Get existing user or create new one based on Cognito user info
        """
        User = get_user_model()
        email = user_info.get("email")

        if not email:
            logger.warning("No email found in user info")
            return None

        try:
            # Try to get existing user
            user = User.objects.get(email=email)

            # Update user info if needed
            self._update_user_info(user, user_info)
            user.save()

            return user

        except User.DoesNotExist:
            # Create new user if auto-creation is enabled
            if auth_settings.AUTO_CREATE_USERS:
                return self._create_user(user_info)
            else:
                logger.warning(
                    f"User {email} does not exist and auto-creation is disabled"
                )
                return None

    def _create_user(self, user_info: dict):
        """
        Create a new user from Cognito user info
        """
        User = get_user_model()

        user_data = {
            "email": user_info.get("email"),
            "username": user_info.get("username", user_info.get("email")),
            "first_name": user_info.get("given_name", ""),
            "last_name": user_info.get("family_name", ""),
            "is_active": True,
            "is_staff": False,
        }

        try:
            user = User.objects.create_user(**user_data)
            logger.info(f"Created new user: {user.email}")
            return user
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            return None

    def _update_user_info(self, user, user_info: dict):
        """
        Update user info from Cognito claims
        """
        updated = False

        if user_info.get("given_name") and user.first_name != user_info["given_name"]:
            user.first_name = user_info["given_name"]
            updated = True

        if user_info.get("family_name") and user.last_name != user_info["family_name"]:
            user.last_name = user_info["family_name"]
            updated = True

        if updated:
            logger.info(f"Updated user info for: {user.email}")
