"""
Tests for authentication providers
"""
from unittest.mock import patch, MagicMock
from django.test import TestCase

from drf_spectacular_auth.providers.cognito import CognitoAuthProvider
from drf_spectacular_auth.providers.base import AuthenticationError


class CognitoAuthProviderTest(TestCase):
    
    @patch('drf_spectacular_auth.providers.cognito.auth_settings')
    def setUp(self, mock_settings):
        mock_settings.COGNITO_REGION = 'us-east-1'
        mock_settings.COGNITO_CLIENT_ID = 'test-client-id'
        mock_settings.COGNITO_CLIENT_SECRET = None
        
        with patch('drf_spectacular_auth.providers.cognito.boto3.client'):
            self.provider = CognitoAuthProvider()
    
    def test_validate_credentials_valid(self):
        credentials = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        result = self.provider.validate_credentials(credentials)
        self.assertTrue(result)
    
    def test_validate_credentials_invalid_email(self):
        credentials = {
            'email': 'invalid-email',
            'password': 'password123'
        }
        
        result = self.provider.validate_credentials(credentials)
        self.assertFalse(result)
    
    def test_validate_credentials_missing_password(self):
        credentials = {
            'email': 'test@example.com',
            'password': ''
        }
        
        result = self.provider.validate_credentials(credentials)
        self.assertFalse(result)
    
    @patch('drf_spectacular_auth.providers.cognito.auth_settings')
    @patch('drf_spectacular_auth.providers.cognito.boto3.client')
    def test_authenticate_success(self, mock_boto_client, mock_settings):
        mock_settings.COGNITO_REGION = 'us-east-1'
        mock_settings.COGNITO_CLIENT_ID = 'test-client-id'
        mock_settings.COGNITO_CLIENT_SECRET = None
        
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        
        mock_client.initiate_auth.return_value = {
            'AuthenticationResult': {
                'AccessToken': 'test-access-token',
                'IdToken': 'test-id-token',
                'RefreshToken': 'test-refresh-token'
            }
        }
        
        mock_client.get_user.return_value = {
            'UserAttributes': [
                {'Name': 'sub', 'Value': 'test-sub'},
                {'Name': 'email', 'Value': 'test@example.com'},
                {'Name': 'email_verified', 'Value': 'true'}
            ]
        }
        
        provider = CognitoAuthProvider()
        credentials = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        result = provider.authenticate(credentials)
        
        self.assertEqual(result['access_token'], 'test-access-token')
        self.assertEqual(result['user']['email'], 'test@example.com')
        self.assertEqual(result['user']['sub'], 'test-sub')
    
    @patch('drf_spectacular_auth.providers.cognito.auth_settings')
    @patch('drf_spectacular_auth.providers.cognito.boto3.client')
    def test_authenticate_invalid_credentials(self, mock_boto_client, mock_settings):
        from botocore.exceptions import ClientError
        
        mock_settings.COGNITO_REGION = 'us-east-1'
        mock_settings.COGNITO_CLIENT_ID = 'test-client-id'
        mock_settings.COGNITO_CLIENT_SECRET = None
        
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        
        mock_client.initiate_auth.side_effect = ClientError(
            {'Error': {'Code': 'NotAuthorizedException', 'Message': 'Invalid credentials'}},
            'InitiateAuth'
        )
        
        provider = CognitoAuthProvider()
        credentials = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        with self.assertRaises(AuthenticationError) as context:
            provider.authenticate(credentials)
        
        self.assertEqual(context.exception.message, 'Invalid email or password')
    
    @patch('drf_spectacular_auth.providers.cognito.auth_settings')
    @patch('drf_spectacular_auth.providers.cognito.boto3.client')
    def test_authenticate_with_client_secret(self, mock_boto_client, mock_settings):
        mock_settings.COGNITO_REGION = 'us-east-1'
        mock_settings.COGNITO_CLIENT_ID = 'test-client-id'
        mock_settings.COGNITO_CLIENT_SECRET = 'test-client-secret'
        
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        
        mock_client.initiate_auth.return_value = {
            'AuthenticationResult': {
                'AccessToken': 'test-access-token',
                'IdToken': 'test-id-token',
                'RefreshToken': 'test-refresh-token'
            }
        }
        
        mock_client.get_user.return_value = {
            'UserAttributes': [
                {'Name': 'sub', 'Value': 'test-sub'},
                {'Name': 'email', 'Value': 'test@example.com'},
                {'Name': 'email_verified', 'Value': 'true'}
            ]
        }
        
        provider = CognitoAuthProvider()
        credentials = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        result = provider.authenticate(credentials)
        
        # Verify that SECRET_HASH was included in the auth parameters
        call_args = mock_client.initiate_auth.call_args
        auth_parameters = call_args[1]['AuthParameters']
        self.assertIn('SECRET_HASH', auth_parameters)
        
        self.assertEqual(result['access_token'], 'test-access-token')
        self.assertEqual(result['user']['email'], 'test@example.com')