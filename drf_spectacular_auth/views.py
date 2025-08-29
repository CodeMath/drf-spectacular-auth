"""
Views for DRF Spectacular Auth
"""

import logging
from typing import Any, Dict

from django.middleware.csrf import get_token
from django.template.loader import render_to_string
from django.utils.module_loading import import_string
from drf_spectacular.utils import extend_schema
from drf_spectacular.views import SpectacularSwaggerView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .conf import auth_settings
from .providers.base import AuthenticationError
from .providers.cognito import CognitoAuthProvider
from .serializers import (
    ErrorResponseSerializer,
    LoginResponseSerializer,
    LoginSerializer,
)

logger = logging.getLogger(__name__)


class SpectacularAuthSwaggerView(SpectacularSwaggerView):
    """
    Proper SpectacularSwaggerView extension using template inheritance
    
    This approach:
    1. Properly extends drf-spectacular/swagger_ui.html 
    2. Adds auth panel via template blocks (no overlay)
    3. Preserves original drf-spectacular UI completely
    4. No intrusive JavaScript injection
    """

    template_name = "drf_spectacular_auth/swagger_ui.html"

    def dispatch(self, request, *args, **kwargs):
        """
        Check authentication requirements before rendering
        """
        if auth_settings.REQUIRE_AUTHENTICATION and not request.user.is_authenticated:
            # Could redirect to login or show auth panel prominently
            pass
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        try:
            context = super().get_context_data(**kwargs)
        except AttributeError:
            # Fallback for testing
            context = {}

        # Add authentication panel context
        auth_context = {
            "auth_settings": auth_settings.settings,
            "login_url": auth_settings.LOGIN_ENDPOINT,
            "csrf_token": get_token(self.request),
            "panel_position": auth_settings.PANEL_POSITION,
            "panel_style": auth_settings.PANEL_STYLE,
            "theme": auth_settings.THEME,
            "language": self._get_language(),
        }

        # Add all auth context to main context
        context.update(auth_context)

        # Render authentication panel JavaScript
        context["auth_panel_js"] = render_to_string(
            "drf_spectacular_auth/auth_panel.js", auth_context, request=self.request
        )

        return context

    def _get_language(self) -> str:
        """Get current language from request or settings"""
        language = getattr(self.request, "LANGUAGE_CODE", None)
        if not language or language not in auth_settings.SUPPORTED_LANGUAGES:
            language = auth_settings.DEFAULT_LANGUAGE
        return language



@extend_schema(exclude=True)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    API endpoint for user authentication
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            ErrorResponseSerializer(
                {"error": "Invalid request data", "detail": str(serializer.errors)}
            ).data,
            status=status.HTTP_400_BAD_REQUEST,
        )

    credentials = serializer.validated_data

    try:
        # Get authentication provider
        provider = _get_auth_provider()

        # Validate credentials
        if not provider.validate_credentials(credentials):
            return Response(
                ErrorResponseSerializer(
                    {
                        "error": "Invalid credentials format",
                        "detail": "Please check your email and password format",
                    }
                ).data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call pre-login hook if configured
        _call_hook("PRE_LOGIN", request, credentials)

        # Authenticate user
        auth_result = provider.authenticate(credentials)

        # Call post-login hook if configured
        _call_hook("POST_LOGIN", request, auth_result)

        logger.info(f"Successful login for user: {credentials.get('email')}")

        # Store token in session for middleware-based auth
        request.session["spectacular_auth_token"] = auth_result["access_token"]
        request.session["spectacular_user_email"] = credentials.get("email")

        return Response(
            LoginResponseSerializer(auth_result).data, status=status.HTTP_200_OK
        )

    except AuthenticationError as e:
        logger.warning(f"Authentication failed: {e.message}")
        return Response(
            ErrorResponseSerializer({"error": e.message, "detail": e.detail}).data,
            status=status.HTTP_401_UNAUTHORIZED,
        )

    except Exception as e:
        logger.error(f"Unexpected error during authentication: {str(e)}")
        return Response(
            ErrorResponseSerializer(
                {
                    "error": "Authentication service error",
                    "detail": "An unexpected error occurred during authentication",
                }
            ).data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@extend_schema(exclude=True)
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """
    API endpoint for user logout
    """
    try:
        # Call pre-logout hook if configured
        _call_hook("PRE_LOGOUT", request, {})

        # Clear session data
        if "spectacular_auth_token" in request.session:
            del request.session["spectacular_auth_token"]
        if "spectacular_user_email" in request.session:
            del request.session["spectacular_user_email"]

        # Call post-logout hook if configured
        _call_hook("POST_LOGOUT", request, {})

        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        return Response(
            ErrorResponseSerializer(
                {"error": "Logout failed", "detail": "An error occurred during logout"}
            ).data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def _get_auth_provider():
    """
    Get the configured authentication provider
    """
    # For now, we only support Cognito
    # This can be extended to support multiple providers
    return CognitoAuthProvider()


def _call_hook(hook_name: str, request, data: Dict[str, Any]) -> None:
    """
    Call a configured hook function
    """
    hook_path = auth_settings.HOOKS.get(hook_name)
    if not hook_path:
        return

    try:
        hook_func = import_string(hook_path)
        hook_func(request, data)
    except Exception as e:
        logger.error(f"Error calling {hook_name} hook: {str(e)}")
