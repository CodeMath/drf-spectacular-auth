# DRF Spectacular Auth

🔐 **Authentication UI for DRF Spectacular with AWS Cognito support**

A Django package that adds a beautiful authentication panel to your DRF Spectacular (Swagger UI) documentation, with built-in support for AWS Cognito and extensible authentication providers.

## ✨ Features

- 🎨 **Beautiful UI**: Clean, modern authentication panel that integrates seamlessly with Swagger UI
- 🔐 **AWS Cognito Support**: Built-in integration with AWS Cognito User Pools
- 📋 **Token Management**: Easy token copying with clipboard integration and manual fallback
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

### Basic Setup

1. Add to your Django settings:

```python
INSTALLED_APPS = [
    'drf_spectacular',
    'drf_spectacular_auth',  # Add this
    # ... your other apps
]

DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'your-aws-region',
    'COGNITO_CLIENT_ID': 'your-cognito-client-id',
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

완전한 사용법 예시를 확인하려면 [examples/](./examples/) 폴더를 참조하세요:

- **[basic_usage/](./examples/basic_usage/)** - 기본적인 Django + DRF + AWS Cognito 통합 예시
- **cognito_integration/** - AWS Cognito 고급 설정 예시 (준비 중)
- **custom_theming/** - 사용자 정의 테마 적용 예시 (준비 중)  
- **hooks_example/** - 로그인/로그아웃 훅 사용법 예시 (준비 중)

### 빠른 테스트

```bash
cd examples/basic_usage
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

브라우저에서 `http://localhost:8000/docs/`에 접속하여 인증이 통합된 Swagger UI를 확인할 수 있습니다.

## ⚙️ Configuration

### Full Configuration Options

```python
DRF_SPECTACULAR_AUTH = {
    # AWS Cognito Settings
    'COGNITO_REGION': 'ap-northeast-2',
    'COGNITO_CLIENT_ID': 'your-client-id',
    
    # API Endpoints
    'LOGIN_ENDPOINT': '/api/auth/login/',
    'LOGOUT_ENDPOINT': '/api/auth/logout/',
    
    # UI Settings
    'PANEL_POSITION': 'top-right',  # top-left, top-right, bottom-left, bottom-right
    'PANEL_STYLE': 'floating',      # floating, embedded
    'AUTO_AUTHORIZE': True,         # Auto-fill authorization headers
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
    
    # Security
    'TOKEN_STORAGE': 'localStorage',  # localStorage, sessionStorage
    'CSRF_PROTECTION': True,
    
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

### Custom Templates

```python
DRF_SPECTACULAR_AUTH = {
    'CUSTOM_TEMPLATES': {
        'auth_panel': 'your_app/custom_auth_panel.html',
        'login_form': 'your_app/custom_login_form.html',
    }
}
```

## 🔧 Development

### Local Development

```bash
git clone https://github.com/yourusername/drf-spectacular-auth.git
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