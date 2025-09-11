# Configuration Reference

Complete configuration options for DRF Spectacular Auth.

## Basic Configuration

### Minimal Setup

```python
DRF_SPECTACULAR_AUTH = {
    'AUTO_AUTHORIZE': True,
}
```

### With AWS Cognito

```python
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-client-id',
    'AUTO_AUTHORIZE': True,
}
```

## AWS Cognito Settings

### Public Client Configuration

For public Cognito clients (no client secret):

```python
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-public-client-id',
    # COGNITO_CLIENT_SECRET is not needed
}
```

### Private Client Configuration

For private Cognito clients (with client secret):

```python
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-private-client-id',
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
}
```

### Cognito Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `COGNITO_REGION` | str | None | AWS region for Cognito User Pool |
| `COGNITO_CLIENT_ID` | str | None | Cognito App Client ID |
| `COGNITO_CLIENT_SECRET` | str | None | Client secret (private clients only) |

## API Endpoint Configuration

### Default Endpoints

```python
DRF_SPECTACULAR_AUTH = {
    'LOGIN_ENDPOINT': '/api/auth/login/',
    'LOGOUT_ENDPOINT': '/api/auth/logout/',
}
```

### Custom Endpoints

```python
DRF_SPECTACULAR_AUTH = {
    'LOGIN_ENDPOINT': '/custom/login/',
    'LOGOUT_ENDPOINT': '/custom/logout/',
}
```

## UI Configuration

### Panel Position and Style

```python
DRF_SPECTACULAR_AUTH = {
    'PANEL_POSITION': 'top-right',  # top-left, top-right, bottom-left, bottom-right
    'PANEL_STYLE': 'floating',      # floating, embedded
}
```

### UI Feature Toggles

```python
DRF_SPECTACULAR_AUTH = {
    'AUTO_AUTHORIZE': True,         # Automatically fill Swagger authorization
    'SHOW_COPY_BUTTON': True,       # Show manual token copy button
    'SHOW_USER_INFO': True,         # Display user email in panel
}
```

### UI Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `PANEL_POSITION` | str | 'top-right' | Position of auth panel |
| `PANEL_STYLE` | str | 'floating' | Style of auth panel |
| `AUTO_AUTHORIZE` | bool | True | Auto-fill Swagger authorization headers |
| `SHOW_COPY_BUTTON` | bool | True | Show manual token copy button |
| `SHOW_USER_INFO` | bool | True | Display user information |

## Theming Configuration

### Color Scheme

```python
DRF_SPECTACULAR_AUTH = {
    'THEME': {
        'PRIMARY_COLOR': '#61affe',
        'SUCCESS_COLOR': '#28a745',
        'ERROR_COLOR': '#dc3545',
        'WARNING_COLOR': '#ffc107',
        'INFO_COLOR': '#17a2b8',
        'BACKGROUND_COLOR': '#ffffff',
        'TEXT_COLOR': '#333333',
    }
}
```

### Layout Styling

```python
DRF_SPECTACULAR_AUTH = {
    'THEME': {
        'BORDER_RADIUS': '8px',
        'SHADOW': '0 2px 10px rgba(0,0,0,0.1)',
        'FONT_FAMILY': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        'FONT_SIZE': '14px',
    }
}
```

### Complete Theme Example

```python
DRF_SPECTACULAR_AUTH = {
    'THEME': {
        # Colors
        'PRIMARY_COLOR': '#2196F3',      # Material Blue
        'SUCCESS_COLOR': '#4CAF50',      # Material Green
        'ERROR_COLOR': '#F44336',        # Material Red
        'WARNING_COLOR': '#FF9800',      # Material Orange
        'INFO_COLOR': '#00BCD4',         # Material Cyan
        'BACKGROUND_COLOR': '#FAFAFA',   # Light grey background
        'TEXT_COLOR': '#212121',         # Dark grey text
        
        # Layout
        'BORDER_RADIUS': '4px',          # Material design radius
        'SHADOW': '0 2px 4px rgba(0,0,0,0.12), 0 0 6px rgba(0,0,0,0.04)',
        'FONT_FAMILY': 'Roboto, Arial, sans-serif',
        'FONT_SIZE': '14px',
        
        # Spacing
        'PADDING': '16px',
        'MARGIN': '8px',
    }
}
```

## Localization Settings

### Language Configuration

```python
DRF_SPECTACULAR_AUTH = {
    'DEFAULT_LANGUAGE': 'ko',                    # Default language
    'SUPPORTED_LANGUAGES': ['ko', 'en', 'ja'],  # Available languages
}
```

### Custom Translations

```python
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_TRANSLATIONS': {
        'en': {
            'login': 'Sign In',
            'logout': 'Sign Out',
            'email': 'Email Address',
            'password': 'Password',
        },
        'ko': {
            'login': '로그인',
            'logout': '로그아웃',
            'email': '이메일',
            'password': '비밀번호',
        }
    }
}
```

### Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English | ✅ Complete |
| `ko` | Korean | ✅ Complete |
| `ja` | Japanese | ✅ Complete |

## Token Storage Configuration

### Storage Options

```python
DRF_SPECTACULAR_AUTH = {
    'TOKEN_STORAGE': 'sessionStorage',  # sessionStorage, localStorage
    'CSRF_PROTECTION': True,            # Enable CSRF protection
}
```

### Token Management

```python
DRF_SPECTACULAR_AUTH = {
    'TOKEN_STORAGE': 'sessionStorage',
    'TOKEN_REFRESH_THRESHOLD': 300,     # Refresh token 5 minutes before expiry
    'AUTO_REFRESH_TOKEN': True,         # Automatically refresh tokens
}
```

### Storage Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `TOKEN_STORAGE` | str | 'sessionStorage' | Browser storage method |
| `CSRF_PROTECTION` | bool | True | Enable CSRF protection |
| `TOKEN_REFRESH_THRESHOLD` | int | 300 | Seconds before expiry to refresh |
| `AUTO_REFRESH_TOKEN` | bool | True | Automatic token refresh |

## User Management Configuration

### Basic User Settings

```python
DRF_SPECTACULAR_AUTH = {
    'AUTO_CREATE_USERS': False,         # Create Django users from Cognito
    'CREATE_TEMP_USER': True,          # Create temp users for docs access
    'REQUIRE_AUTHENTICATION': False,    # Require auth for Swagger UI
}
```

### Advanced User Management

```python
DRF_SPECTACULAR_AUTH = {
    'AUTO_CREATE_USERS': True,
    'USER_CREATION_FIELDS': [           # Fields to copy from Cognito
        'email',
        'first_name',
        'last_name',
    ],
    'USER_UPDATE_ON_LOGIN': True,       # Update user info on each login
    'TEMP_USER_PREFIX': 'temp_',        # Prefix for temporary users
}
```

### User Management Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `AUTO_CREATE_USERS` | bool | False | Auto-create Django users |
| `CREATE_TEMP_USER` | bool | True | Create temporary users |
| `REQUIRE_AUTHENTICATION` | bool | False | Require auth for Swagger UI |
| `USER_CREATION_FIELDS` | list | ['email'] | Fields to copy from Cognito |
| `USER_UPDATE_ON_LOGIN` | bool | False | Update user on login |

## Security Configuration

### Security Hardening

```python
DRF_SPECTACULAR_AUTH = {
    'CSRF_PROTECTION': True,
    'SECURE_COOKIES': True,            # Use secure cookies in production
    'SAME_SITE_COOKIES': 'Lax',       # SameSite cookie attribute
    'SESSION_COOKIE_AGE': 3600,       # Session timeout (seconds)
}
```

### Rate Limiting

```python
DRF_SPECTACULAR_AUTH = {
    'RATE_LIMITING': {
        'ENABLED': True,
        'LOGIN_ATTEMPTS': 5,           # Max login attempts per minute
        'LOCKOUT_DURATION': 300,       # Lockout duration in seconds
    }
}
```

## Custom Template Configuration

### Template Overrides

```python
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_TEMPLATES': {
        'auth_panel': 'your_app/custom_auth_panel.html',
        'login_form': 'your_app/custom_login_form.html',
        'swagger_ui': 'your_app/custom_swagger_ui.html',
    }
}
```

### Template Context

```python
DRF_SPECTACULAR_AUTH = {
    'TEMPLATE_CONTEXT': {
        'site_name': 'Your API Documentation',
        'company_logo': '/static/img/logo.png',
        'support_email': 'support@yourcompany.com',
    }
}
```

## Extensibility Configuration

### Custom Authentication Providers

```python
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_AUTH_PROVIDERS': [
        'your_app.providers.AzureADProvider',
        'your_app.providers.OktaProvider',
    ]
}
```

### Hooks Configuration

```python
DRF_SPECTACULAR_AUTH = {
    'HOOKS': {
        'PRE_LOGIN': 'your_app.hooks.pre_login_handler',
        'POST_LOGIN': 'your_app.hooks.post_login_handler',
        'PRE_LOGOUT': 'your_app.hooks.pre_logout_handler',
        'POST_LOGOUT': 'your_app.hooks.post_logout_handler',
        'TOKEN_REFRESH': 'your_app.hooks.token_refresh_handler',
    }
}
```

### Middleware Configuration

```python
DRF_SPECTACULAR_AUTH = {
    'MIDDLEWARE_SETTINGS': {
        'AUTO_AUTHENTICATE': True,      # Automatically authenticate users
        'SKIP_PATHS': [                # Paths to skip authentication
            '/api/public/',
            '/health/',
        ],
        'REQUIRE_PATHS': [             # Paths that require authentication
            '/api/admin/',
        ],
    }
}
```

## Complete Example Configuration

```python
import os

DRF_SPECTACULAR_AUTH = {
    # AWS Cognito
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': os.getenv('COGNITO_CLIENT_ID'),
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
    
    # API Endpoints
    'LOGIN_ENDPOINT': '/api/auth/login/',
    'LOGOUT_ENDPOINT': '/api/auth/logout/',
    
    # UI Settings
    'PANEL_POSITION': 'top-right',
    'PANEL_STYLE': 'floating',
    'AUTO_AUTHORIZE': True,
    'SHOW_COPY_BUTTON': True,
    'SHOW_USER_INFO': True,
    
    # Theming
    'THEME': {
        'PRIMARY_COLOR': '#2196F3',
        'SUCCESS_COLOR': '#4CAF50',
        'ERROR_COLOR': '#F44336',
        'BACKGROUND_COLOR': '#FAFAFA',
        'BORDER_RADIUS': '4px',
        'SHADOW': '0 2px 4px rgba(0,0,0,0.12)',
    },
    
    # Localization
    'DEFAULT_LANGUAGE': 'en',
    'SUPPORTED_LANGUAGES': ['en', 'ko', 'ja'],
    
    # Token Storage
    'TOKEN_STORAGE': 'sessionStorage',
    'CSRF_PROTECTION': True,
    'AUTO_REFRESH_TOKEN': True,
    
    # User Management
    'AUTO_CREATE_USERS': True,
    'CREATE_TEMP_USER': True,
    'REQUIRE_AUTHENTICATION': False,
    'USER_CREATION_FIELDS': ['email', 'first_name', 'last_name'],
    
    # Security
    'RATE_LIMITING': {
        'ENABLED': True,
        'LOGIN_ATTEMPTS': 5,
        'LOCKOUT_DURATION': 300,
    },
    
    # Hooks
    'HOOKS': {
        'POST_LOGIN': 'your_app.hooks.post_login_handler',
        'POST_LOGOUT': 'your_app.hooks.post_logout_handler',
    },
    
    # Custom Providers
    'CUSTOM_AUTH_PROVIDERS': [
        'your_app.providers.CustomProvider',
    ],
}
```

## Environment Variables

For security, use environment variables for sensitive settings:

```bash
# .env
COGNITO_CLIENT_SECRET=your-secret-here
DJANGO_SECRET_KEY=your-django-secret
```

```python
# settings.py
import os
from dotenv import load_dotenv

load_dotenv()

DRF_SPECTACULAR_AUTH = {
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
}
```

## Next Steps

- [Customization Guide](customization.md)
- [Examples](examples.md)
- [API Reference](api_reference.md)