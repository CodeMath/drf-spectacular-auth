# Simplified DRF Spectacular Auth - Usage Guide

This simplified approach resolves template loading issues by using JavaScript-based dynamic injection instead of complex template inheritance.

## Key Benefits

✅ **No Template Conflicts** - Uses original drf-spectacular template as base
✅ **JavaScript Dynamic Injection** - Auth panel injected via JavaScript
✅ **Self-Contained** - No complex template inheritance issues  
✅ **Minimal Code Footprint** - Simple and lightweight implementation
✅ **Loading Issue Resolution** - Eliminates template context propagation problems

## Quick Setup

### 1. Install Package
```bash
pip install drf-spectacular-auth==1.1.0
```

### 2. Django Settings
```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes', 
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_spectacular',
    'drf_spectacular_auth',  # Add this
    # your other apps...
]

# DRF Spectacular Auth Configuration
DRF_SPECTACULAR_AUTH = {
    # AWS Cognito Configuration
    'COGNITO': {
        'USER_POOL_ID': 'your-user-pool-id',
        'CLIENT_ID': 'your-client-id', 
        'CLIENT_SECRET': 'your-client-secret',  # For private clients
        'REGION': 'us-east-1',
    },
    
    # UI Configuration
    'PANEL_POSITION': 'top-right',  # top-left, top-right, bottom-left, bottom-right
    'AUTO_AUTHORIZE': True,         # Automatically set bearer token in Swagger
    'SHOW_COPY_BUTTON': True,       # Show copy token button
    'TOKEN_STORAGE': 'localStorage', # localStorage or sessionStorage
    
    # Theme Configuration  
    'THEME': {
        'PRIMARY_COLOR': '#007bff',
        'SUCCESS_COLOR': '#28a745', 
        'ERROR_COLOR': '#dc3545',
        'BACKGROUND_COLOR': '#ffffff',
        'BORDER_RADIUS': '4px',
        'SHADOW': '0 2px 4px rgba(0,0,0,0.1)',
        'FONT_FAMILY': 'Arial, sans-serif',
    }
}
```

### 3. URLs Configuration
```python
# urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular_auth.views import SpectacularAuthSwaggerView
from drf_spectacular.views import SpectacularAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/', include('drf_spectacular_auth.urls')),
    # your other URLs...
]
```

### 4. That's It!

Visit `http://localhost:8000/api/docs/` and you'll see:

🔐 **Cognito Login Panel** - Floating auth panel (position configurable)
📋 **Token Management** - Copy token button for manual authorization
🚀 **Auto-Authorization** - Automatic Swagger UI bearer token setup
🌍 **Multi-Language** - Korean, English, Japanese support

## How It Works

### JavaScript Dynamic Injection

Instead of complex template inheritance, this approach:

1. **Inherits SpectacularSwaggerView** - Uses standard drf-spectacular as base
2. **Injects via JavaScript** - Auth panel created dynamically on page load
3. **Zero Template Conflicts** - No template inheritance issues
4. **Self-Contained** - All HTML, CSS, JS generated in single view

### View Implementation
```python
class SpectacularAuthSwaggerView(SpectacularSwaggerView):
    """
    Minimal extension that injects auth panel via JavaScript
    """
    template_name = "drf_spectacular_auth/simple_swagger_ui.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Prepare auth configuration
        auth_config = {
            'loginUrl': '/api/auth/login/',
            'csrfToken': get_token(self.request),
            'language': 'en',  # Auto-detected
            'settings': { /* theme and behavior settings */ }
        }
        
        # Inject JavaScript with config
        context['drf_auth_config'] = json.dumps(auth_config)
        context['drf_auth_inject_script'] = self._generate_injection_script()
        
        return context
```

### Template Structure
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Swagger API Documentation</title>
    <link rel="stylesheet" href="swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    
    <!-- Standard Swagger UI initialization -->
    <script src="swagger-ui-bundle.js"></script>
    <script>/* Standard Swagger setup */</script>
    
    <!-- DRF Auth Panel Dynamic Injection -->
    {{ drf_auth_inject_script|safe }}
  </body>
</html>
```

## Language Support

The auth panel automatically detects language and supports:

- **Korean (ko)** - 한국어 지원
- **English (en)** - English support  
- **Japanese (ja)** - 日本語サポート

Language detection uses Django's `LANGUAGE_CODE` or falls back to English.

## Authentication Flow

1. **User enters credentials** in floating auth panel
2. **POST to /api/auth/login/** with email/password
3. **Cognito authentication** via boto3
4. **Token storage** in localStorage/sessionStorage
5. **Auto-authorization** in Swagger UI (if enabled)
6. **UI updates** to show authenticated state

## Troubleshooting

### Template Loading Issues (Resolved)
❌ **Old approach**: Complex template inheritance caused loading problems
✅ **New approach**: JavaScript injection eliminates template conflicts

### Common Issues

**Auth panel not appearing:**
- Check browser console for JavaScript errors
- Verify Django settings configuration
- Ensure templates are in correct location

**Cognito authentication failing:**
- Verify AWS Cognito configuration
- Check CLIENT_SECRET for private clients
- Confirm USER_POOL_ID and REGION

**Token not auto-authorizing:**
- Set `AUTO_AUTHORIZE: True` in settings
- Check browser's localStorage/sessionStorage
- Verify Swagger UI is fully loaded

## Migration from Previous Versions

If upgrading from previous versions with loading issues:

```python
# Before (problematic)
from drf_spectacular_auth.views import SpectacularAuthSwaggerView

# After (simplified - same import!)
from drf_spectacular_auth.views import SpectacularAuthSwaggerView
```

The import is the same, but the implementation now uses JavaScript injection instead of template inheritance.

## Advanced Configuration

### Custom Panel Position
```python
DRF_SPECTACULAR_AUTH = {
    'PANEL_POSITION': 'bottom-left',  # top-left, top-right, bottom-left, bottom-right
}
```

### Custom Theme Colors
```python
DRF_SPECTACULAR_AUTH = {
    'THEME': {
        'PRIMARY_COLOR': '#6f42c1',      # Purple primary
        'SUCCESS_COLOR': '#20c997',       # Teal success  
        'ERROR_COLOR': '#e83e8c',         # Pink error
        'BACKGROUND_COLOR': '#f8f9fa',    # Light gray background
    }
}
```

### Token Storage Options
```python
DRF_SPECTACULAR_AUTH = {
    'TOKEN_STORAGE': 'sessionStorage',  # Clears on browser close
    # OR
    'TOKEN_STORAGE': 'localStorage',    # Persists across sessions
}
```

## Support

- **GitHub Issues**: https://github.com/CodeMath/drf-spectacular-auth/issues
- **Documentation**: https://github.com/CodeMath/drf-spectacular-auth#readme

This simplified approach should resolve all template loading issues while maintaining full functionality.