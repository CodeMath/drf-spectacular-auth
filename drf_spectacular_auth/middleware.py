"""
Middleware for DRF Spectacular Auth
"""

import logging
from typing import Optional

from django.contrib.auth import get_user_model, login
from django.http import HttpRequest, HttpResponse
from django.urls import resolve
from django.utils.deprecation import MiddlewareMixin

from .conf import auth_settings
from .providers.cognito import CognitoAuthProvider

logger = logging.getLogger(__name__)


class SpectacularAuthMiddleware(MiddlewareMixin):
    """
    Middleware to handle authentication for DRF Spectacular views
    """

    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)

    def process_request(self, request: HttpRequest) -> Optional[HttpResponse]:
        """
        Process incoming requests to check authentication
        """
        # Skip if not a spectacular view
        if not self._is_spectacular_view(request):
            return None

        # Check if user is already authenticated
        if request.user.is_authenticated:
            return None

        # Check for token in headers (from auth panel)
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            user = self._authenticate_with_token(token)
            if user:
                login(request, user)
                return None

        # No session-based authentication - use sessionStorage on client side only

        return None

    def _is_spectacular_view(self, request: HttpRequest) -> bool:
        """
        Check if the current request is for a spectacular view
        """
        try:
            resolver_match = resolve(request.path_info)
            view_name = resolver_match.view_name

            # Check if it's a spectacular-related view
            spectacular_views = ["schema", "swagger-ui", "redoc", "spectacular"]

            return any(
                spectacular in str(view_name).lower()
                for spectacular in spectacular_views
            )
        except Exception:
            return False

    def _authenticate_with_token(self, token: str):
        """
        Authenticate user with JWT token
        """
        try:
            provider = CognitoAuthProvider()

            # Verify token and get user info
            user_info = provider.verify_token(token)
            if user_info:
                # Try to get existing user or create a temporary one
                User = get_user_model()

                try:
                    user = User.objects.get(email=user_info.get("email"))
                    return user
                except User.DoesNotExist:
                    # For documentation access, we can create a temporary user
                    # or return a simple authenticated user object
                    if auth_settings.CREATE_TEMP_USER:
                        return self._create_temp_user(user_info)

        except Exception as e:
            logger.error(f"Token authentication failed: {e}")

        return None

    def _create_temp_user(self, user_info: dict):
        """
        Create a temporary user for documentation access
        """
        User = get_user_model()

        # Create a temporary user with minimal info
        temp_user = User(
            email=user_info.get("email", "temp@example.com"),
            username=user_info.get("email", "temp_user"),
            first_name=user_info.get("given_name", ""),
            last_name=user_info.get("family_name", ""),
            is_active=True,
            is_staff=False,
        )
        # Don't save to database - just use for this request
        temp_user.backend = "drf_spectacular_auth.backend.SpectacularAuthBackend"
        return temp_user
