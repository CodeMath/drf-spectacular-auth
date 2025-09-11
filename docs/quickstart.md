# Quick Start Guide

This guide will get you up and running with DRF Spectacular Auth in under 5 minutes.

## 1. Install the Package

```bash
pip install drf-spectacular-auth
```

## 2. Basic Django Setup

### Add to INSTALLED_APPS

```python
# settings.py
INSTALLED_APPS = [
    'drf_spectacular_auth',  # Must be before drf_spectacular
    'drf_spectacular',
    'rest_framework',
    # ... your other apps
]
```

### Configure DRF Spectacular

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Your API',
    'DESCRIPTION': 'Your project description',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

## 3. Add Authentication Configuration

### Basic Configuration (No AWS Cognito)

```python
# settings.py
DRF_SPECTACULAR_AUTH = {
    'AUTO_AUTHORIZE': True,
    'SHOW_COPY_BUTTON': True,
}
```

### With AWS Cognito

```python
# settings.py
DRF_SPECTACULAR_AUTH = {
    # AWS Cognito Settings
    'COGNITO_REGION': 'ap-northeast-2',  # Your AWS region
    'COGNITO_CLIENT_ID': 'your-cognito-client-id',
    
    # Optional: For private clients
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
    
    # UI Settings
    'AUTO_AUTHORIZE': True,
    'SHOW_COPY_BUTTON': True,
    'SHOW_USER_INFO': True,
}
```

## 4. Configure URLs

```python
# urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular_auth.views import SpectacularAuthSwaggerView
from drf_spectacular.views import SpectacularAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/', include('drf_spectacular_auth.urls')),
    
    # API schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Swagger UI with authentication
    path('api/docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Your API endpoints
    path('api/', include('your_app.urls')),
]
```

## 5. Create a Simple API View (Optional)

```python
# your_app/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({
        'message': 'Hello, authenticated user!',
        'user': str(request.user)
    })

# your_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('protected/', views.protected_view, name='protected'),
]
```

## 6. Run the Server

```bash
python manage.py migrate
python manage.py runserver
```

## 7. Test the Authentication

1. Open your browser to `http://localhost:8000/api/docs/`
2. You should see Swagger UI with an authentication panel
3. If using AWS Cognito:
   - Enter your Cognito credentials
   - Click "Login"
   - The token should automatically authorize API calls
4. Try calling a protected endpoint

## What's Next?

### Customize the Authentication Panel

```python
DRF_SPECTACULAR_AUTH = {
    # Position and style
    'PANEL_POSITION': 'top-right',  # top-left, bottom-left, bottom-right
    'PANEL_STYLE': 'floating',      # floating, embedded
    
    # Theming
    'THEME': {
        'PRIMARY_COLOR': '#61affe',
        'SUCCESS_COLOR': '#28a745',
        'ERROR_COLOR': '#dc3545',
    },
    
    # Localization
    'DEFAULT_LANGUAGE': 'en',  # ko, en, ja
}
```

### Add Custom Authentication Provider

```python
from drf_spectacular_auth.providers.base import AuthProvider

class CustomAuthProvider(AuthProvider):
    def authenticate(self, credentials):
        # Your custom authentication logic
        return {
            'access_token': 'your-token',
            'user': {'email': 'user@example.com'}
        }

# Register in settings
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_AUTH_PROVIDERS': [
        'your_app.providers.CustomAuthProvider'
    ]
}
```

### Enable Advanced Features

```python
DRF_SPECTACULAR_AUTH = {
    # User management
    'AUTO_CREATE_USERS': True,     # Create Django users from Cognito
    'REQUIRE_AUTHENTICATION': True, # Require auth for Swagger UI
    
    # Middleware integration
    'CREATE_TEMP_USER': True,      # Create temp users for docs access
    
    # Hooks
    'HOOKS': {
        'POST_LOGIN': 'your_app.hooks.post_login_handler',
        'POST_LOGOUT': 'your_app.hooks.post_logout_handler',
    }
}
```

## Common Use Cases

### 1. Development Documentation

Perfect for internal API documentation with simple authentication:

```python
DRF_SPECTACULAR_AUTH = {
    'AUTO_AUTHORIZE': True,
    'SHOW_COPY_BUTTON': True,
    'REQUIRE_AUTHENTICATION': False,
}
```

### 2. Production API Documentation

Secure documentation for production environments:

```python
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'your-region',
    'COGNITO_CLIENT_ID': 'your-client-id',
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
    'REQUIRE_AUTHENTICATION': True,
    'AUTO_CREATE_USERS': True,
}
```

### 3. Multi-language Documentation

Support for international teams:

```python
DRF_SPECTACULAR_AUTH = {
    'DEFAULT_LANGUAGE': 'ko',
    'SUPPORTED_LANGUAGES': ['ko', 'en', 'ja'],
    'THEME': {
        'PRIMARY_COLOR': '#2196F3',  # Material Blue
    }
}
```

## Troubleshooting

### Authentication Panel Not Showing

1. Check that `drf_spectacular_auth` is in `INSTALLED_APPS` **before** `drf_spectacular`
2. Ensure you're using `SpectacularAuthSwaggerView` instead of the default Swagger view
3. Clear browser cache and reload

### AWS Cognito Authentication Fails

1. Verify your `COGNITO_REGION` and `COGNITO_CLIENT_ID`
2. For private clients, ensure `COGNITO_CLIENT_SECRET` is set
3. Check AWS Cognito logs for detailed error messages

### Tokens Not Auto-Authorizing

1. Verify `AUTO_AUTHORIZE: True` in settings
2. Check browser console for JavaScript errors
3. Ensure your OpenAPI schema includes proper security definitions

## Next Steps

- [Configuration Reference](configuration.md)
- [Customization Guide](customization.md)
- [Examples](examples.md)
- [API Reference](api_reference.md)