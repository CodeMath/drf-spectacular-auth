"""
Base authentication provider interface
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class AuthProvider(ABC):
    """
    Base class for authentication providers
    """

    @abstractmethod
    def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """
        Authenticate user with provided credentials

        Args:
            credentials: Dictionary containing authentication credentials

        Returns:
            Dictionary containing authentication result with keys:
            - access_token: JWT or access token
            - user: User information dictionary
            - message: Optional success message

        Raises:
            AuthenticationError: When authentication fails
        """
        pass

    @abstractmethod
    def get_user_info(self, token: str) -> Dict[str, Any]:
        """
        Get user information from access token

        Args:
            token: Access token

        Returns:
            Dictionary containing user information

        Raises:
            AuthenticationError: When token is invalid
        """
        pass

    def validate_credentials(self, credentials: Dict[str, Any]) -> bool:
        """
        Validate credentials format

        Args:
            credentials: Dictionary containing authentication credentials

        Returns:
            True if credentials are valid, False otherwise
        """
        return True

    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token

        Args:
            refresh_token: Refresh token

        Returns:
            Dictionary containing new tokens

        Raises:
            NotImplementedError: If provider doesn't support token refresh
        """
        raise NotImplementedError("Token refresh not supported by this provider")


class AuthenticationError(Exception):
    """
    Exception raised when authentication fails
    """

    def __init__(self, message: str, detail: Optional[str] = None):
        self.message = message
        self.detail = detail
        super().__init__(message)
