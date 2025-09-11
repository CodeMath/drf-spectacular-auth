# Customization Guide

Learn how to customize DRF Spectacular Auth to match your brand and requirements.

## Custom Authentication Providers

### Creating a Custom Provider

Extend the base `AuthProvider` class to create your own authentication provider:

```python
# your_app/providers.py
from drf_spectacular_auth.providers.base import AuthProvider
import requests

class AzureADProvider(AuthProvider):
    """Custom Azure AD authentication provider"""
    
    def authenticate(self, credentials):
        """
        Authenticate user with Azure AD
        
        Args:
            credentials (dict): User credentials containing 'email' and 'password'
            
        Returns:
            dict: Authentication result with 'access_token' and 'user' info
        """
        try:
            # Azure AD authentication logic
            response = requests.post(
                'https://login.microsoftonline.com/your-tenant/oauth2/v2.0/token',
                data={
                    'grant_type': 'password',
                    'client_id': 'your-client-id',
                    'username': credentials['email'],
                    'password': credentials['password'],
                    'scope': 'openid profile email',
                }
            )
            
            if response.status_code == 200:
                token_data = response.json()
                return {
                    'access_token': token_data['access_token'],
                    'user': {
                        'email': credentials['email'],
                        'name': 'User Name',  # Extract from token if available
                    }
                }
            else:
                raise Exception('Authentication failed')
                
        except Exception as e:
            raise Exception(f'Azure AD authentication error: {str(e)}')
    
    def get_user_info(self, token):
        """
        Get user information from token
        
        Args:
            token (str): Access token
            
        Returns:
            dict: User information
        """
        try:
            response = requests.get(
                'https://graph.microsoft.com/v1.0/me',
                headers={'Authorization': f'Bearer {token}'}
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    'email': user_data.get('mail'),
                    'name': user_data.get('displayName'),
                    'id': user_data.get('id'),
                }
            else:
                return None
                
        except Exception:
            return None

class CustomOAuthProvider(AuthProvider):
    """Generic OAuth2 provider"""
    
    def __init__(self, config):
        self.client_id = config.get('client_id')
        self.client_secret = config.get('client_secret')
        self.auth_url = config.get('auth_url')
        self.token_url = config.get('token_url')
        self.user_info_url = config.get('user_info_url')
    
    def authenticate(self, credentials):
        # OAuth2 flow implementation
        pass
    
    def get_user_info(self, token):
        # User info retrieval
        pass
```

### Registering Custom Providers

```python
# settings.py
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_AUTH_PROVIDERS': [
        'your_app.providers.AzureADProvider',
        'your_app.providers.CustomOAuthProvider',
    ],
    
    # Provider-specific configuration
    'PROVIDER_CONFIG': {
        'AzureADProvider': {
            'tenant_id': 'your-tenant-id',
            'client_id': 'your-client-id',
        },
        'CustomOAuthProvider': {
            'client_id': 'oauth-client-id',
            'client_secret': 'oauth-client-secret',
            'auth_url': 'https://auth.example.com/oauth/authorize',
            'token_url': 'https://auth.example.com/oauth/token',
            'user_info_url': 'https://auth.example.com/user',
        }
    }
}
```

## Custom UI Themes

### Complete Theme Customization

```python
# settings.py
DRF_SPECTACULAR_AUTH = {
    'THEME': {
        # Brand Colors
        'PRIMARY_COLOR': '#1976D2',      # Your brand primary color
        'SECONDARY_COLOR': '#424242',    # Secondary brand color
        'SUCCESS_COLOR': '#388E3C',      # Success state color
        'ERROR_COLOR': '#D32F2F',        # Error state color
        'WARNING_COLOR': '#F57C00',      # Warning state color
        'INFO_COLOR': '#0288D1',         # Info state color
        
        # Background & Surface
        'BACKGROUND_COLOR': '#FAFAFA',   # Main background
        'SURFACE_COLOR': '#FFFFFF',      # Card/panel background
        'OVERLAY_COLOR': 'rgba(0,0,0,0.5)', # Modal overlay
        
        # Text Colors
        'TEXT_COLOR': '#212121',         # Primary text
        'TEXT_SECONDARY': '#757575',     # Secondary text
        'TEXT_DISABLED': '#BDBDBD',      # Disabled text
        'TEXT_ON_PRIMARY': '#FFFFFF',    # Text on primary color
        
        # Layout & Spacing
        'BORDER_RADIUS': '8px',          # Border radius for elements
        'BORDER_RADIUS_SMALL': '4px',    # Small border radius
        'SHADOW': '0 2px 8px rgba(0,0,0,0.1)', # Box shadow
        'SHADOW_HOVER': '0 4px 12px rgba(0,0,0,0.15)', # Hover shadow
        
        # Typography
        'FONT_FAMILY': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'FONT_SIZE_SMALL': '12px',
        'FONT_SIZE_BASE': '14px',
        'FONT_SIZE_LARGE': '16px',
        'FONT_WEIGHT_NORMAL': '400',
        'FONT_WEIGHT_MEDIUM': '500',
        'FONT_WEIGHT_BOLD': '600',
        
        # Spacing Scale
        'SPACING_XS': '4px',
        'SPACING_SM': '8px',
        'SPACING_MD': '16px',
        'SPACING_LG': '24px',
        'SPACING_XL': '32px',
        
        # Form Elements
        'INPUT_HEIGHT': '40px',
        'BUTTON_HEIGHT': '40px',
        'INPUT_BORDER': '1px solid #E0E0E0',
        'INPUT_BORDER_FOCUS': '2px solid #1976D2',
        
        # Animation
        'TRANSITION_FAST': '0.15s ease',
        'TRANSITION_NORMAL': '0.25s ease',
        'TRANSITION_SLOW': '0.35s ease',
    }
}
```

### Dark Theme Example

```python
# settings.py - Dark theme configuration
DRF_SPECTACULAR_AUTH = {
    'THEME': {
        # Dark theme colors
        'PRIMARY_COLOR': '#90CAF9',      # Light blue for dark theme
        'SECONDARY_COLOR': '#CE93D8',    # Light purple
        'SUCCESS_COLOR': '#A5D6A7',      # Light green
        'ERROR_COLOR': '#EF5350',        # Light red
        'WARNING_COLOR': '#FFB74D',      # Light orange
        'INFO_COLOR': '#64B5F6',         # Light blue
        
        # Dark backgrounds
        'BACKGROUND_COLOR': '#121212',   # Dark background
        'SURFACE_COLOR': '#1E1E1E',      # Dark surface
        'OVERLAY_COLOR': 'rgba(0,0,0,0.8)',
        
        # Dark theme text
        'TEXT_COLOR': '#FFFFFF',         # White text
        'TEXT_SECONDARY': '#B0B0B0',     # Light grey
        'TEXT_DISABLED': '#666666',      # Dark grey
        'TEXT_ON_PRIMARY': '#000000',    # Black on light colors
        
        # Dark theme borders
        'INPUT_BORDER': '1px solid #333333',
        'INPUT_BORDER_FOCUS': '2px solid #90CAF9',
    }
}
```

### Multiple Theme Support

```python
# settings.py
DRF_SPECTACULAR_AUTH = {
    'THEMES': {
        'light': {
            'PRIMARY_COLOR': '#1976D2',
            'BACKGROUND_COLOR': '#FFFFFF',
            'TEXT_COLOR': '#212121',
            # ... other light theme settings
        },
        'dark': {
            'PRIMARY_COLOR': '#90CAF9',
            'BACKGROUND_COLOR': '#121212',
            'TEXT_COLOR': '#FFFFFF',
            # ... other dark theme settings
        },
        'corporate': {
            'PRIMARY_COLOR': '#00695C',  # Corporate teal
            'SECONDARY_COLOR': '#004D40',
            'BACKGROUND_COLOR': '#F5F5F5',
            # ... corporate theme settings
        }
    },
    'DEFAULT_THEME': 'light',
    'ALLOW_THEME_SWITCHING': True,  # Enable theme switcher in UI
}
```

## Custom Templates

### Template Structure

```
your_app/templates/
├── drf_spectacular_auth/
│   ├── auth_panel.html          # Main authentication panel
│   ├── login_form.html          # Login form component
│   ├── user_info.html           # User information display
│   └── swagger_ui.html          # Complete Swagger UI template
└── base/
    └── swagger_base.html        # Base template for Swagger UI
```

### Custom Authentication Panel

```html
<!-- your_app/templates/drf_spectacular_auth/auth_panel.html -->
{% load static %}

<div id="auth-panel" class="custom-auth-panel">
    <div class="auth-header">
        <img src="{% static 'img/your-logo.png' %}" alt="Company Logo" class="auth-logo">
        <h3>{{ site_name|default:"API Authentication" }}</h3>
    </div>
    
    <div class="auth-content">
        {% if user.is_authenticated %}
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-details">
                    <span class="user-name">{{ user.email }}</span>
                    <span class="user-role">{{ user.role|default:"User" }}</span>
                </div>
                <button id="logout-btn" class="btn btn-outline">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        {% else %}
            <form id="login-form" class="auth-form">
                {% csrf_token %}
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required 
                           placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required 
                           placeholder="Enter your password">
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </form>
        {% endif %}
    </div>
    
    <div class="auth-footer">
        <a href="mailto:{{ support_email|default:'support@company.com' }}">
            Need help?
        </a>
    </div>
</div>

<style>
.custom-auth-panel {
    background: var(--surface-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: var(--spacing-lg);
    min-width: 320px;
}

.auth-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
}

.auth-logo {
    height: 40px;
    margin-bottom: var(--spacing-sm);
}

.user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.user-avatar i {
    font-size: 32px;
    color: var(--primary-color);
}

.auth-form .form-group {
    margin-bottom: var(--spacing-md);
}

.auth-footer {
    text-align: center;
    margin-top: var(--spacing-lg);
    font-size: var(--font-size-small);
}
</style>
```

### Custom Swagger UI Template

```html
<!-- your_app/templates/drf_spectacular_auth/swagger_ui.html -->
{% extends "drf_spectacular/swagger_ui.html" %}
{% load static %}

{% block extra_head %}
    {{ block.super }}
    <link rel="stylesheet" href="{% static 'css/custom-swagger.css' %}">
    <script src="{% static 'js/custom-auth.js' %}"></script>
{% endblock %}

{% block navbar_extra %}
    <!-- Custom navigation items -->
    <div class="custom-nav-items">
        <a href="/api/docs/" class="nav-link">API Docs</a>
        <a href="/admin/" class="nav-link">Admin</a>
        {% if user.is_authenticated %}
            <span class="nav-user">Welcome, {{ user.email }}</span>
        {% endif %}
    </div>
{% endblock %}

{% block footer %}
    <footer class="custom-footer">
        <div class="footer-content">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
            <div class="footer-links">
                <a href="/privacy/">Privacy Policy</a>
                <a href="/terms/">Terms of Service</a>
                <a href="/support/">Support</a>
            </div>
        </div>
    </footer>
{% endblock %}
```

### Registering Custom Templates

```python
# settings.py
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_TEMPLATES': {
        'auth_panel': 'your_app/drf_spectacular_auth/auth_panel.html',
        'login_form': 'your_app/drf_spectacular_auth/login_form.html',
        'swagger_ui': 'your_app/drf_spectacular_auth/swagger_ui.html',
    },
    
    # Template context variables
    'TEMPLATE_CONTEXT': {
        'site_name': 'Your API Documentation',
        'company_name': 'Your Company',
        'support_email': 'api-support@yourcompany.com',
        'logo_url': '/static/img/logo.png',
        'version': '1.0.0',
    }
}
```

## Custom CSS and JavaScript

### Custom Styles

```css
/* static/css/custom-swagger.css */

:root {
    --brand-primary: #1976D2;
    --brand-secondary: #424242;
    --brand-success: #388E3C;
    --brand-error: #D32F2F;
    --brand-surface: #FFFFFF;
    --brand-background: #FAFAFA;
}

/* Custom Swagger UI styling */
.swagger-ui {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.swagger-ui .topbar {
    background-color: var(--brand-primary);
    padding: 0;
}

.swagger-ui .topbar .download-url-wrapper {
    display: none; /* Hide the default input field */
}

/* Custom authentication panel */
.auth-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--brand-surface);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 20px;
    min-width: 300px;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.auth-panel.collapsed {
    transform: translateX(calc(100% - 40px));
    opacity: 0.7;
}

.auth-panel:hover.collapsed {
    transform: translateX(0);
    opacity: 1;
}

/* Form styling */
.auth-form .form-group {
    margin-bottom: 16px;
}

.auth-form label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: var(--brand-secondary);
}

.auth-form input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.auth-form input:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* Button styling */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background-color: var(--brand-primary);
    color: white;
}

.btn-primary:hover {
    background-color: #1565C0;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-outline {
    background-color: transparent;
    color: var(--brand-secondary);
    border: 1px solid #E0E0E0;
}

.btn-outline:hover {
    background-color: #F5F5F5;
}

/* Responsive design */
@media (max-width: 768px) {
    .auth-panel {
        position: relative;
        top: auto;
        right: auto;
        margin: 20px;
        min-width: auto;
    }
    
    .auth-panel.collapsed {
        transform: none;
        opacity: 1;
    }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
    :root {
        --brand-surface: #1E1E1E;
        --brand-background: #121212;
        --brand-secondary: #E0E0E0;
    }
    
    .swagger-ui {
        filter: invert(1) hue-rotate(180deg);
    }
    
    .auth-panel {
        filter: invert(1) hue-rotate(180deg);
    }
}
```

### Custom JavaScript

```javascript
// static/js/custom-auth.js

class CustomAuth {
    constructor() {
        this.initializeAuth();
        this.setupEventListeners();
    }
    
    initializeAuth() {
        // Check for existing authentication
        const token = sessionStorage.getItem('auth_token');
        if (token) {
            this.validateToken(token);
        }
    }
    
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // Theme switcher
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.addEventListener('change', this.handleThemeSwitch.bind(this));
        }
        
        // Panel collapse/expand
        const authPanel = document.querySelector('.auth-panel');
        if (authPanel) {
            this.setupPanelInteractions(authPanel);
        }
    }
    
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.handleLoginSuccess(result);
            } else {
                this.handleLoginError(result.error || 'Login failed');
            }
        } catch (error) {
            this.handleLoginError('Network error occurred');
        } finally {
            this.showLoading(false);
        }
    }
    
    handleLoginSuccess(result) {
        // Store authentication token
        sessionStorage.setItem('auth_token', result.access_token);
        sessionStorage.setItem('user_info', JSON.stringify(result.user));
        
        // Update UI
        this.updateAuthPanel(result.user);
        
        // Auto-authorize Swagger UI
        if (window.ui) {
            this.authorizeSwagger(result.access_token);
        }
        
        // Show success message
        this.showNotification('Login successful!', 'success');
        
        // Custom hook
        this.triggerCustomEvent('auth:login', result);
    }
    
    handleLoginError(error) {
        this.showNotification(error, 'error');
        this.triggerCustomEvent('auth:error', { error });
    }
    
    async handleLogout() {
        try {
            await fetch('/api/auth/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            // Clear local storage
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_info');
            
            // Update UI
            this.updateAuthPanel(null);
            
            // Clear Swagger authorization
            if (window.ui) {
                this.clearSwaggerAuth();
            }
            
            this.showNotification('Logged out successfully', 'info');
            this.triggerCustomEvent('auth:logout');
        }
    }
    
    authorizeSwagger(token) {
        if (window.ui && window.ui.authActions) {
            // Auto-detect security scheme
            const spec = window.ui.getState().get('spec').toJS();
            const securitySchemes = spec.components?.securitySchemes || {};
            
            const schemeNames = Object.keys(securitySchemes);
            const bearerScheme = schemeNames.find(name => 
                securitySchemes[name].type === 'http' && 
                securitySchemes[name].scheme === 'bearer'
            );
            
            if (bearerScheme) {
                window.ui.authActions.authorize({
                    [bearerScheme]: {
                        name: bearerScheme,
                        schema: securitySchemes[bearerScheme],
                        value: token
                    }
                });
            }
        }
    }
    
    clearSwaggerAuth() {
        if (window.ui && window.ui.authActions) {
            window.ui.authActions.logout();
        }
    }
    
    setupPanelInteractions(panel) {
        // Collapse/expand functionality
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'panel-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        toggleBtn.onclick = () => panel.classList.toggle('collapsed');
        
        panel.appendChild(toggleBtn);
        
        // Auto-collapse on mobile
        if (window.innerWidth <= 768) {
            panel.classList.add('collapsed');
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                panel.classList.add('collapsed');
            } else {
                panel.classList.remove('collapsed');
            }
        });
    }
    
    handleThemeSwitch(event) {
        const theme = event.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred_theme', theme);
    }
    
    showLoading(show) {
        const submitBtn = document.querySelector('#login-form button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').onclick = () => {
            notification.remove();
        };
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    }
    
    triggerCustomEvent(eventName, data = {}) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
    
    updateAuthPanel(user) {
        // This would update the auth panel HTML based on user state
        // Implementation depends on your specific UI structure
        location.reload(); // Simple approach - reload page
    }
    
    async validateToken(token) {
        try {
            const response = await fetch('/api/auth/validate/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                // Token is invalid, clear it
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('user_info');
            }
        } catch (error) {
            console.warn('Token validation failed:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomAuth();
});

// Export for external use
window.CustomAuth = CustomAuth;
```

## Hooks and Callbacks

### Authentication Hooks

```python
# your_app/hooks.py

def pre_login_handler(credentials, request):
    """
    Called before authentication attempt
    
    Args:
        credentials (dict): User credentials
        request (HttpRequest): Django request object
        
    Returns:
        dict: Modified credentials or None to proceed unchanged
    """
    # Log login attempt
    import logging
    logger = logging.getLogger('auth')
    logger.info(f"Login attempt for user: {credentials.get('email')}")
    
    # Rate limiting check
    from django.core.cache import cache
    email = credentials.get('email')
    attempt_key = f"login_attempts_{email}"
    attempts = cache.get(attempt_key, 0)
    
    if attempts >= 5:
        raise Exception("Too many login attempts. Please try again later.")
    
    # Update attempt count
    cache.set(attempt_key, attempts + 1, timeout=300)  # 5 minutes
    
    return credentials

def post_login_handler(user, token, request):
    """
    Called after successful authentication
    
    Args:
        user (dict): User information
        token (str): Access token
        request (HttpRequest): Django request object
    """
    # Clear failed attempts
    from django.core.cache import cache
    email = user.get('email')
    attempt_key = f"login_attempts_{email}"
    cache.delete(attempt_key)
    
    # Log successful login
    import logging
    logger = logging.getLogger('auth')
    logger.info(f"Successful login for user: {email}")
    
    # Create/update Django user
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    django_user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email,
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
        }
    )
    
    if not created:
        # Update user information
        django_user.first_name = user.get('first_name', django_user.first_name)
        django_user.last_name = user.get('last_name', django_user.last_name)
        django_user.save()
    
    # Send welcome email for new users
    if created:
        from django.core.mail import send_mail
        send_mail(
            'Welcome to our API',
            f'Welcome {user.get("first_name", "User")}! Your account has been created.',
            'noreply@yourcompany.com',
            [email],
            fail_silently=True,
        )

def pre_logout_handler(user, request):
    """Called before logout"""
    import logging
    logger = logging.getLogger('auth')
    logger.info(f"Logout initiated for user: {user.get('email')}")

def post_logout_handler(user, request):
    """Called after logout"""
    import logging
    logger = logging.getLogger('auth')
    logger.info(f"User logged out: {user.get('email')}")

def token_refresh_handler(old_token, new_token, user, request):
    """Called when token is refreshed"""
    import logging
    logger = logging.getLogger('auth')
    logger.info(f"Token refreshed for user: {user.get('email')}")
```

### Register Hooks

```python
# settings.py
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

## Next Steps

- [Examples](examples.md) - See complete implementation examples
- [API Reference](api_reference.md) - Detailed API documentation
- [Troubleshooting](troubleshooting.md) - Common issues and solutions