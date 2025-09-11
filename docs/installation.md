# Installation

## Requirements

- Python 3.8+
- Django 3.2+
- Django REST Framework 3.12+
- drf-spectacular 0.25.0+

## Installation Methods

### From PyPI (Recommended)

```bash
pip install drf-spectacular-auth
```

### Latest Development Version

```bash
pip install git+https://github.com/CodeMath/drf-spectacular-auth.git
```

### For Development

```bash
git clone https://github.com/CodeMath/drf-spectacular-auth.git
cd drf-spectacular-auth
pip install -e ".[dev]"
```

## Post-Installation Setup

### 1. Add to Django Settings

```python
INSTALLED_APPS = [
    'drf_spectacular_auth',  # Must be before 'drf_spectacular'
    'drf_spectacular',
    # ... your other apps
]
```

**Important**: `drf_spectacular_auth` must be added **before** `drf_spectacular` in `INSTALLED_APPS` to ensure proper template inheritance.

### 2. Optional: Authentication Backend

```python
AUTHENTICATION_BACKENDS = [
    'drf_spectacular_auth.backend.SpectacularAuthBackend',
    'django.contrib.auth.backends.ModelBackend',  # Keep default backend
]
```

### 3. Optional: Middleware

```python
MIDDLEWARE = [
    # ... your existing middleware
    'drf_spectacular_auth.middleware.SpectacularAuthMiddleware',
    # ... rest of your middleware
]
```

### 4. Basic Configuration

```python
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'your-aws-region',
    'COGNITO_CLIENT_ID': 'your-cognito-client-id',
    'AUTO_AUTHORIZE': True,
}
```

### 5. URL Configuration

```python
from django.urls import path, include
from drf_spectacular_auth.views import SpectacularAuthSwaggerView

urlpatterns = [
    path('api/auth/', include('drf_spectacular_auth.urls')),
    path('api/docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ... your other urls
]
```

## Verification

After installation, visit your Swagger UI URL (e.g., `http://localhost:8000/api/docs/`) and you should see the authentication panel.

## Common Installation Issues

### Template Loading Errors

**Problem**: Template loading errors or missing authentication panel.

**Solution**: Ensure `drf_spectacular_auth` is added to `INSTALLED_APPS` **before** `drf_spectacular`.

### Import Errors

**Problem**: `ImportError` when importing components.

**Solution**: Verify all dependencies are installed:

```bash
pip install Django djangorestframework drf-spectacular boto3
```

### Version Conflicts

**Problem**: Dependency version conflicts.

**Solution**: Check compatibility:

```bash
pip list | grep -E "(Django|djangorestframework|drf-spectacular|boto3)"
```

Refer to the compatibility matrix in our documentation for supported versions.

## Next Steps

- [Quick Start Guide](quickstart.md)
- [Configuration Options](configuration.md)
- [Examples](examples.md)