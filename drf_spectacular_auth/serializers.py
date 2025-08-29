"""
Serializers for DRF Spectacular Auth
"""
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login requests
    """
    email = serializers.EmailField(
        help_text="User email address",
        write_only=True
    )
    password = serializers.CharField(
        help_text="User password",
        write_only=True,
        style={'input_type': 'password'}
    )


class UserSerializer(serializers.Serializer):
    """
    Serializer for user information
    """
    sub = serializers.CharField(
        help_text="User identifier (Cognito sub)",
        read_only=True
    )
    email = serializers.EmailField(
        help_text="User email address",
        read_only=True
    )


class LoginResponseSerializer(serializers.Serializer):
    """
    Serializer for login responses
    """
    access_token = serializers.CharField(
        help_text="JWT Access Token for authentication",
        read_only=True
    )
    user = UserSerializer(
        help_text="User information",
        read_only=True
    )
    message = serializers.CharField(
        help_text="Login status message",
        read_only=True
    )


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer for error responses
    """
    error = serializers.CharField(
        help_text="Error message",
        read_only=True
    )
    detail = serializers.CharField(
        help_text="Error details",
        read_only=True,
        required=False
    )