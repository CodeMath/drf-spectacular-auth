"""
Configuration system for DRF Spectacular Auth
"""

DEFAULTS = {
    # AWS Cognito Settings
    "COGNITO_REGION": "us-east-1",
    "COGNITO_CLIENT_ID": None,  # Required
    "COGNITO_CLIENT_SECRET": None,  # Optional - for private clients only
    # API Endpoints
    "LOGIN_ENDPOINT": "/api/auth/login/",
    "LOGOUT_ENDPOINT": "/api/auth/logout/",
    # UI Settings
    "PANEL_POSITION": "top-right",  # top-left, top-right, bottom-left, bottom-right
    "PANEL_STYLE": "floating",  # floating, embedded
    "AUTO_AUTHORIZE": True,  # Auto-fill authorization headers (basic preauthorizeApiKey)
    "SHOW_COPY_BUTTON": True,  # Show token copy button
    "SHOW_USER_INFO": True,  # Show user email in panel
    # Theming
    "THEME": {
        "PRIMARY_COLOR": "#61affe",
        "SUCCESS_COLOR": "#28a745",
        "ERROR_COLOR": "#dc3545",
        "BACKGROUND_COLOR": "#ffffff",
        "BORDER_RADIUS": "8px",
        "SHADOW": "0 2px 10px rgba(0,0,0,0.1)",
        "FONT_FAMILY": (
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ),
    },
    # Localization
    "DEFAULT_LANGUAGE": "en",
    "SUPPORTED_LANGUAGES": ["ko", "en", "ja"],
    # Token Storage (Simplified)
    "TOKEN_STORAGE": "sessionStorage",  # localStorage or sessionStorage
    "CSRF_PROTECTION": True,
    # User Management
    "AUTO_CREATE_USERS": False,  # Auto-create users from successful authentication
    "CREATE_TEMP_USER": True,  # Create temporary users for documentation access
    "REQUIRE_AUTHENTICATION": False,  # Require auth to access Swagger UI
    # Extensibility
    "CUSTOM_AUTH_PROVIDERS": [],
    "CUSTOM_TEMPLATES": {},
    "HOOKS": {
        "PRE_LOGIN": None,
        "POST_LOGIN": None,
        "PRE_LOGOUT": None,
        "POST_LOGOUT": None,
    },
}


class SpectacularAuthSettings:
    """
    Settings object for DRF Spectacular Auth
    """

    def __init__(self):
        # Check if Django settings are configured
        try:
            from django.conf import settings as django_settings

            if django_settings.configured:
                self.user_settings = getattr(
                    django_settings, "DRF_SPECTACULAR_AUTH", {}
                )
            else:
                self.user_settings = {}
        except ImportError:
            # Django not available
            self.user_settings = {}

        self._settings = {**DEFAULTS, **self.user_settings}

        # Merge nested dictionaries properly (like THEME)
        for key, default_value in DEFAULTS.items():
            if isinstance(default_value, dict) and key in self.user_settings:
                self._settings[key] = {**default_value, **self.user_settings[key]}

    def __getattr__(self, attr):
        if attr not in self._settings:
            raise AttributeError(f"Invalid setting: '{attr}'")
        return self._settings[attr]

    def get(self, key, default=None):
        return self._settings.get(key, default)

    @property
    def settings(self):
        return self._settings


# Global settings instance
auth_settings = SpectacularAuthSettings()
