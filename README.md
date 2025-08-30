# DRF Spectacular Auth

🔐 **Authentication UI for DRF Spectacular with AWS Cognito support**

[![PyPI version](https://badge.fury.io/py/drf-spectacular-auth.svg)](https://badge.fury.io/py/drf-spectacular-auth)
[![Python](https://img.shields.io/pypi/pyversions/drf-spectacular-auth.svg)](https://pypi.org/project/drf-spectacular-auth/)
[![Django](https://img.shields.io/badge/django-3.2%2B-blue.svg)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A Django package that adds a beautiful authentication panel to your DRF Spectacular (Swagger UI) documentation, with built-in support for AWS Cognito and extensible authentication providers.

## 🆕 What's New in v1.3.1

- 🎯 **HttpOnly Cookie + AUTO_AUTHORIZE** - Automatic Swagger UI authorization now works with HttpOnly cookies
- 🔒 **Smart Token Management** - One-time token exposure for Swagger UI setup with immediate cleanup
- ⚡ **Seamless UX** - Login → Auto-authorized Swagger UI (no manual token copying needed)
- 🏗️ **Industry-Standard Pattern** - Based on Azure API Management and enterprise solutions
- 🔄 **Full Compatibility** - Works with HttpOnly cookies, localStorage, and sessionStorage modes

## 📈 Previous Updates (v1.3.0)

- 🔐 **HttpOnly Cookie Security** - Enhanced XSS protection with secure token storage
- 🛡️ **90%+ Security Improvement** - CSRF protection with SameSite cookies
- 🔄 **Backward Compatibility** - Seamless upgrade with fallback to localStorage/sessionStorage
- 🧹 **Code Optimization** - Improved imports, cleaner structure, removed cache files
- 📚 **Migration Guide** - Complete HttpOnly Cookie migration documentation
- 🔧 **Enhanced Middleware** - Better cookie-based authentication handling

## ✨ Features

- 🔐 **Enhanced Security**: HttpOnly cookies with XSS and CSRF protection
- 🎨 **Beautiful UI**: Clean, modern authentication panel that integrates seamlessly with Swagger UI
- 🛡️ **AWS Cognito Support**: Built-in integration with AWS Cognito User Pools
- 📋 **Smart Token Management**: Secure cookie-based with localStorage fallback
- 🎯 **Auto Authorization**: Automatically populates Swagger UI authorization headers
- 🎨 **Customizable**: Flexible theming and positioning options
- 🌍 **i18n Ready**: Multi-language support (Korean, English, Japanese)
- 🔧 **Extensible**: Plugin system for additional authentication providers
- 📦 **Easy Integration**: Minimal setup with sensible defaults

## 🚀 Quick Start

### Installation

```bash
pip install drf-spectacular-auth
```

Or get the latest version:

```bash
pip install --upgrade drf-spectacular-auth
```

### Basic Setup

1. Add to your Django settings:

```python
INSTALLED_APPS = [
    'drf_spectacular_auth',  # Add 'drf_spectacular_auth' before 'drf_spectacular'
    'drf_spectacular',
    # ... your other apps
]

# Optional: Add authentication backend for better integration
AUTHENTICATION_BACKENDS = [
    'drf_spectacular_auth.backend.SpectacularAuthBackend',
    'django.contrib.auth.backends.ModelBackend',  # Keep default backend
]

# Optional: Add middleware for automatic authentication
MIDDLEWARE = [
    # ... your existing middleware
    'drf_spectacular_auth.middleware.SpectacularAuthMiddleware',
    # ... rest of your middleware
]

DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'your-aws-region',
    'COGNITO_CLIENT_ID': 'your-cognito-client-id',
    'COGNITO_CLIENT_SECRET': 'your-client-secret',  # Private client인 경우에만 필요
    
    # Optional: User management settings
    'AUTO_CREATE_USERS': True,  # Auto-create users from Cognito
    'REQUIRE_AUTHENTICATION': False,  # Require auth to access Swagger UI
}
```

2. Update your URLs:

```python
from drf_spectacular_auth.views import SpectacularAuthSwaggerView

urlpatterns = [
    path('api/auth/', include('drf_spectacular_auth.urls')),  # Authentication endpoints
    path('api/docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ... your other urls
]
```

3. That's it! 🎉 Your Swagger UI now has an authentication panel.

## 📁 Examples

Please Example Check [examples/](./examples/).

- **[basic_usage/](./examples/basic_usage/)** - Basic Django + DRF + AWS Cognito integration example
- **cognito_integration/** - AWS Cognito integration (Not yet)
- **custom_theming/** - Custom thema example (Not yet)  
- **hooks_example/** - Login and Logout hook example (Not yet)

### Test

```bash
cd examples/basic_usage
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Check browser `http://localhost:8000/docs/` 

## 🏗️ Architecture

### Integration Strategies

This package offers multiple integration strategies to suit different use cases:

**1. Simple Auth Panel (Default)**
- Adds authentication panel to Swagger UI
- Minimal configuration required
- Good for basic documentation with optional authentication

**2. HttpOnly Cookie Integration (Recommended)**
- Secure HttpOnly cookie-based token storage  
- XSS attack protection
- Automatic authentication handling
- CSRF protection with SameSite cookies

**3. Middleware Integration**
- Session-based auth persistence
- Better integration with existing Django auth

**4. Backend Integration (Advanced)**
- Full Django user integration
- Auto-create users from Cognito
- Supports existing Django permission systems

### Comparison with django-auth-adfs

Unlike django-auth-adfs which focuses on ADFS/Azure AD integration, this package:
- Specializes in AWS Cognito authentication
- Focuses on API documentation (Swagger UI) integration
- Offers lighter-weight integration options
- Supports both simple overlay and full Django auth integration

## ⚙️ Configuration

### AWS Cognito Client Types

**Public Client** (Basic):
- Not Client Secret
- `COGNITO_CLIENT_SECRET=None`

**Private Client** (Enhanced):
- Need Client Secret
- Must have `COGNITO_CLIENT_SECRET`
- Automatic calculate SECRET_HASH

```python
# Public Client (Basic)
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-public-client-id',
}

# Private Client (Enhanced)
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-private-client-id',
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
}
```

### Full Configuration Options

```python
DRF_SPECTACULAR_AUTH = {
    # AWS Cognito Settings
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-client-id',
    'COGNITO_CLIENT_SECRET': None,
    
    # API Endpoints
    'LOGIN_ENDPOINT': '/api/auth/login/',
    'LOGOUT_ENDPOINT': '/api/auth/logout/',
    
    # UI Settings
    'PANEL_POSITION': 'top-right',  # top-left, top-right, bottom-left, bottom-right
    'PANEL_STYLE': 'floating',      # floating, embedded
    'AUTO_AUTHORIZE': True,         # Auto-fill authorization headers (v1.3.1: Works with HttpOnly cookies!)
    'SHOW_COPY_BUTTON': True,       # Show token copy button
    'SHOW_USER_INFO': True,         # Show user email in panel
    
    # Theming
    'THEME': {
        'PRIMARY_COLOR': '#61affe',
        'SUCCESS_COLOR': '#28a745',
        'ERROR_COLOR': '#dc3545',
        'BACKGROUND_COLOR': '#ffffff',
        'BORDER_RADIUS': '8px',
        'SHADOW': '0 2px 10px rgba(0,0,0,0.1)',
    },
    
    # Localization
    'DEFAULT_LANGUAGE': 'ko',
    'SUPPORTED_LANGUAGES': ['ko', 'en', 'ja'],
    
    # Security (Enhanced)
    'USE_HTTPONLY_COOKIE': True,      # HttpOnly cookie storage (Recommended)
    'TOKEN_STORAGE': 'sessionStorage', # localStorage, sessionStorage (Fallback)
    'COOKIE_MAX_AGE': 3600,           # Cookie expiry in seconds (1 hour)
    'COOKIE_SECURE': True,            # HTTPS only (set False for development)
    'COOKIE_SAMESITE': 'Strict',      # CSRF protection
    'CSRF_PROTECTION': True,
    
    # User Management
    'AUTO_CREATE_USERS': False,  # Auto-create users from successful authentication
    'CREATE_TEMP_USER': True,   # Create temporary users for documentation access
    'REQUIRE_AUTHENTICATION': False,  # Require auth to access Swagger UI
    
    # Extensibility
    'CUSTOM_AUTH_PROVIDERS': [],
    'HOOKS': {
        'PRE_LOGIN': None,
        'POST_LOGIN': None,
        'PRE_LOGOUT': None,
        'POST_LOGOUT': None,
    }
}
```

## 🎨 Customization

### Custom Authentication Provider

```python
from drf_spectacular_auth.providers.base import AuthProvider

class CustomAuthProvider(AuthProvider):
    def authenticate(self, credentials):
        # Your custom authentication logic
        return {
            'access_token': 'your-token',
            'user': {'email': 'user@example.com'}
        }
    
    def get_user_info(self, token):
        # Get user information from token
        return {'email': 'user@example.com'}

# Register your provider
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_AUTH_PROVIDERS': [
        'path.to.your.CustomAuthProvider'
    ]
}
```

### Custom Security Schemes

The package automatically detects your OpenAPI security schemes and supports custom names:

```python
# drf-spectacular settings
SPECTACULAR_SETTINGS = {
    "APPEND_COMPONENTS": {
        "securitySchemes": {
            "CognitoJWT": {
                "type": "http",
                "scheme": "bearer", 
                "bearerFormat": "JWT",
                "description": "AWS Cognito JWT authentication",
            }
        },
    },
    "SECURITY": [{"CognitoJWT": []}],
}

# Or using OpenApiAuthenticationExtension
class CognitoJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "your_app.authentication.CognitoJWTAuthentication"
    name = "CognitoJWT"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT", 
            "description": "AWS Cognito JWT authentication",
        }
```

**Supported scheme names**: `CognitoJWT`, `BearerAuth`, `Bearer`, `JWT`, `ApiKeyAuth`, `TokenAuth`, and any custom name defined in your OpenAPI spec.

### Custom Templates

```python
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_TEMPLATES': {
        'auth_panel': 'your_app/custom_auth_panel.html',
        'login_form': 'your_app/custom_login_form.html',
    }
}
```

## 🐛 Troubleshooting

### Common Issues

**Q: I see unwanted topbar in my Swagger UI**  
A: Update to v1.2.0+ which fixes the template inheritance issue.

**Q: Authentication panel is not showing**  
A: Make sure you're using `SpectacularAuthSwaggerView` instead of the default Swagger view.

**Q: Token not being auto-authorized in Swagger**  
A: Verify that `AUTO_AUTHORIZE: True` is set in your settings and check browser console for errors. The system automatically detects your security scheme name from the OpenAPI spec, supporting custom names like `CognitoJWT`, `Bearer`, etc.

**Q: AWS Cognito authentication fails**  
A: Check your Cognito configuration:
- Verify `COGNITO_REGION`, `COGNITO_CLIENT_ID` are correct
- For private clients, ensure `COGNITO_CLIENT_SECRET` is set
- Check AWS Cognito logs for detailed error messages

**Q: Template loading errors**  
A: Ensure `drf_spectacular_auth` is added to `INSTALLED_APPS` before `drf_spectacular`.

### Migration from Previous Versions

**From v1.1.x to v1.2.0:**
- No breaking changes - just update your package
- Topbar issues will be automatically resolved
- Remove any custom workarounds for template conflicts

## 🔧 Development

### Local Development

```bash
git clone https://github.com/CodeMath/drf-spectacular-auth.git
cd drf-spectacular-auth
pip install -e ".[dev]"
```

### Running Tests

```bash
pytest
pytest --cov=drf_spectacular_auth
```

### Code Quality

```bash
black .
isort .
flake8
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DRF Spectacular](https://github.com/tfranzel/drf-spectacular) for the excellent API documentation framework
- [AWS Cognito](https://aws.amazon.com/cognito/) for authentication services
- [Swagger UI](https://swagger.io/tools/swagger-ui/) for the beautiful API documentation interface

## 📚 Links

- [Documentation](https://github.com/CodeMath/drf-spectacular-auth#readme)
- [PyPI](https://pypi.org/project/drf-spectacular-auth/)
- [GitHub](https://github.com/CodeMath/drf-spectacular-auth)
- [Issues](https://github.com/CodeMath/drf-spectacular-auth/issues)