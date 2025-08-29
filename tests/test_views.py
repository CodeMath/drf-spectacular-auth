"""
Tests for DRF Spectacular Auth views
"""
import json
from unittest.mock import patch, MagicMock

from django.test import TestCase, RequestFactory
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APITestCase
from rest_framework import status

from drf_spectacular_auth.views import SpectacularAuthSwaggerView, login_view
from drf_spectacular_auth.providers.base import AuthenticationError


class SpectacularAuthSwaggerViewTest(TestCase):
    
    def setUp(self):
        self.factory = RequestFactory()
        self.view = SpectacularAuthSwaggerView()
    
    def test_get_context_data(self):
        request = self.factory.get('/docs/')
        request.user = AnonymousUser()
        
        self.view.request = request
        self.view.kwargs = {}
        context = self.view.get_context_data()
        
        self.assertIn('auth_panel_html', context)
        self.assertIn('auth_panel_js', context)


class LoginViewTest(APITestCase):
    
    def test_login_invalid_data(self):
        response = self.client.post('/auth/login/', {
            'email': 'invalid-email',
            'password': ''
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    @patch('drf_spectacular_auth.views._get_auth_provider')
    def test_login_success(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_provider.validate_credentials.return_value = True
        mock_provider.authenticate.return_value = {
            'access_token': 'test-token',
            'user': {'email': 'test@example.com', 'sub': 'test-sub'},
            'message': 'Login successful'
        }
        mock_get_provider.return_value = mock_provider
        
        response = self.client.post('/auth/login/', {
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertEqual(response.data['access_token'], 'test-token')
    
    @patch('drf_spectacular_auth.views._get_auth_provider')
    def test_login_authentication_error(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_provider.validate_credentials.return_value = True
        mock_provider.authenticate.side_effect = AuthenticationError(
            'Invalid credentials', 'Email or password is incorrect'
        )
        mock_get_provider.return_value = mock_provider
        
        response = self.client.post('/auth/login/', {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid credentials')
    
    @patch('drf_spectacular_auth.views._get_auth_provider')
    def test_login_invalid_credentials_format(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_provider.validate_credentials.return_value = False
        mock_get_provider.return_value = mock_provider
        
        response = self.client.post('/auth/login/', {
            'email': 'valid@email.com',  # Valid email format
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid credentials format')