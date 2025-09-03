# 📚 DRF Spectacular Auth 완벽 가이드

**Django REST Framework Swagger UI에 AWS Cognito 인증을 쉽게 통합하는 완전한 튜토리얼**

---

## 🎯 이 튜토리얼에서 배울 내용

1. **기본 설치 및 설정** - 5분 만에 동작하는 인증 패널
2. **AWS Cognito 연동** - 실제 사용자 인증 구현
3. **SessionStorage 토큰 관리 (v1.4.2)** - 단순하고 안정적인 인증 방식
4. **커스터마이징** - 테마, 언어, 위치 설정
5. **프로덕션 배포** - 실제 서비스 적용 방법

---

## 📋 사전 준비사항

- Python 3.8+
- Django 3.2+
- Django REST Framework 3.12+
- drf-spectacular 0.25.0+
- AWS Cognito User Pool (선택사항)

---

## 🚀 Chapter 1: 기본 설치 및 첫 실행

### 1.1 패키지 설치

```bash
pip install drf-spectacular-auth
```

### 1.2 Django 설정

**settings.py**에 앱 추가:
```python
INSTALLED_APPS = [
    'drf_spectacular_auth',  # drf_spectacular 보다 먼저 추가
    'drf_spectacular',
    'rest_framework',
    # ... 기타 앱들
]
```

### 1.3 URL 패턴 설정

**urls.py**:
```python
from django.contrib import admin
from django.urls import path, include
from drf_spectacular_auth.views import SpectacularAuthSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('drf_spectacular_auth.urls')),
    path('api/docs/', SpectacularAuthSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # 기존 API 경로들...
]
```

### 1.4 첫 실행 확인

```bash
python manage.py runserver
```

브라우저에서 `http://localhost:8000/api/docs/`를 방문하면 우상단에 **🔐 Cognito Login** 패널이 나타납니다!

> **💡 팁**: 이 단계에서는 실제 AWS Cognito 없이도 UI가 표시됩니다. 다음 단계에서 실제 인증을 설정합니다.

---

## 🔐 Chapter 2: AWS Cognito 연동

### 2.1 AWS Cognito User Pool 생성

1. AWS Console → Cognito → User Pools 생성
2. **App Client** 생성 (Public 또는 Private)
3. 필요한 정보 수집:
   - Region (예: `us-east-1`)
   - User Pool ID
   - App Client ID
   - App Client Secret (Private 클라이언트만)

### 2.2 Django 설정 추가

**settings.py**:
```python
DRF_SPECTACULAR_AUTH = {
    # AWS Cognito 설정
    'COGNITO_REGION': 'us-east-1',
    'COGNITO_CLIENT_ID': 'your-client-id-here',
    'COGNITO_CLIENT_SECRET': 'your-secret-here',  # Private 클라이언트만

    # 로그인 & 로그아웃 엔드포인트(기본 경로와 다를 경우 반드시 입력)
    "LOGIN_ENDPOINT": "/api/auth/login/",
    "LOGOUT_ENDPOINT": "/api/auth/logout/",
    
    # 기본 설정
    'AUTO_AUTHORIZE': True,  # 로그인 시 자동으로 Swagger에 토큰 적용
    'SHOW_COPY_BUTTON': True,  # 토큰 복사 버튼 표시
}
```

### 2.3 테스트 사용자 생성

AWS Console에서 테스트 사용자를 생성하거나, 자가 등록이 활성화된 경우 직접 가입할 수 있습니다.

### 2.4 인증 테스트

1. Swagger UI에서 로그인 시도
2. 성공 시 패널이 **🟢 인증됨** 상태로 변경
3. API 호출 시 자동으로 Authorization 헤더 적용 확인

---

## 🛡️ Chapter 3: SessionStorage 토큰 관리 (v1.4.0+ 단순화)

### 3.1 SessionStorage 방식의 장점

**v1.4.0+ 단순화된 접근법**:
- **단순성**: 복잡한 쿠키 설정 불필요
- **투명성**: 개발자가 쉽게 디버깅 가능  
- **안정성**: 브라우저 호환성 문제 없음
- **유연성**: 수동 토큰 복사로 호환성 보장

### 3.2 SessionStorage 설정

**settings.py**에 단순화된 설정:
```python
DRF_SPECTACULAR_AUTH = {
    # 기존 Cognito 설정...
    
    # 토큰 저장 방식 (v1.4.0+에서 단순화)
    'TOKEN_STORAGE': 'sessionStorage',  # sessionStorage 또는 localStorage
    'AUTO_AUTHORIZE': True,             # Swagger UI 자동 인증 시도
    'SHOW_COPY_BUTTON': True,           # 토큰 수동 복사 버튼 표시
}
```

### 3.3 토큰 관리 검증 방법

**브라우저 개발자 도구에서 확인**:
1. 로그인 후 F12 → Application 탭 → Session Storage 확인
2. drf-spectacular-auth 관련 토큰 저장 확인  
3. 페이지 새로고침 후 인증 상태 유지 확인

---

## 🎨 Chapter 4: UI 커스터마이징

### 4.1 테마 커스터마이징

**settings.py**:
```python
DRF_SPECTACULAR_AUTH = {
    # 기존 설정...
    
    'THEME': {
        'PRIMARY_COLOR': '#007bff',      # 파란색 테마
        'SUCCESS_COLOR': '#28a745',     # 성공 색상
        'ERROR_COLOR': '#dc3545',       # 오류 색상
        'BACKGROUND_COLOR': '#ffffff',   # 배경색
        'BORDER_RADIUS': '8px',         # 모서리 둥글기
        'SHADOW': '0 4px 12px rgba(0,0,0,0.15)',  # 그림자
    },
}
```

### 4.2 패널 위치 변경

```python
DRF_SPECTACULAR_AUTH = {
    # 기존 설정...
    
    'PANEL_POSITION': 'bottom-left',  # top-left, top-right, bottom-left, bottom-right
    'PANEL_STYLE': 'floating',        # floating, embedded
}
```

### 4.3 다국어 설정

```python
DRF_SPECTACULAR_AUTH = {
    # 기존 설정...
    
    'DEFAULT_LANGUAGE': 'ko',         # 기본 언어
    'SUPPORTED_LANGUAGES': ['ko', 'en', 'ja'],  # 지원 언어
}
```

---

## 🔧 Chapter 5: 고급 통합 방법

### 5.1 Django 미들웨어 통합

**더 매끄러운 인증 경험을 위해**:

**settings.py**:
```python
MIDDLEWARE = [
    # 기존 미들웨어들...
    'drf_spectacular_auth.middleware.SpectacularAuthMiddleware',
    # 나머지 미들웨어들...
]

AUTHENTICATION_BACKENDS = [
    'drf_spectacular_auth.backend.SpectacularAuthBackend',
    'django.contrib.auth.backends.ModelBackend',  # 기본 백엔드 유지
]
```

**장점**:
- 로그인 시 자동으로 Django 사용자 객체 생성/연동
- `request.user`로 인증된 사용자 정보 접근 가능
- Django의 권한 시스템과 완전 통합

### 5.2 사용자 자동 생성 설정

```python
DRF_SPECTACULAR_AUTH = {
    # 기존 설정...
    
    'AUTO_CREATE_USERS': True,        # Cognito 사용자를 Django 사용자로 자동 생성
    'CREATE_TEMP_USER': True,         # 임시 사용자 생성 (문서 접근용)
    'REQUIRE_AUTHENTICATION': False,  # 인증 없이도 Swagger 접근 허용
}
```

### 5.3 훅(Hook) 시스템 활용

**커스텀 로그인 로직 추가**:

```python
# hooks.py
def post_login_hook(request, auth_result):
    """로그인 후 실행되는 커스텀 로직"""
    user_email = auth_result.get('user', {}).get('email')
    print(f"사용자 {user_email}가 로그인했습니다.")
    
    # 로그인 로그 기록, 알림 전송 등...

def pre_logout_hook(request, data):
    """로그아웃 전 실행되는 커스텀 로직"""
    if hasattr(request, 'user') and request.user.is_authenticated:
        print(f"사용자 {request.user.email}가 로그아웃합니다.")
```

**settings.py**:
```python
DRF_SPECTACULAR_AUTH = {
    # 기존 설정...
    
    'HOOKS': {
        'POST_LOGIN': 'myapp.hooks.post_login_hook',
        'PRE_LOGOUT': 'myapp.hooks.pre_logout_hook',
    },
}
```

---

## 🚀 Chapter 6: 프로덕션 배포

### 6.1 프로덕션 보안 설정

**settings_prod.py**:
```python
DRF_SPECTACULAR_AUTH = {
    # 기존 설정...
    
    # 🔒 프로덕션 보안 강화 (v1.4.2)
    'TOKEN_STORAGE': 'sessionStorage',  # 안전한 토큰 저장
    'CSRF_PROTECTION': True,            # CSRF 보호
    'AUTO_AUTHORIZE': True,             # 자동 인증
    
    # UI 설정
    'SHOW_COPY_BUTTON': True,           # 토큰 복사 버튼
    'REQUIRE_AUTHENTICATION': True,     # 인증 필수
}
```

### 6.2 환경 변수 활용

```python
import os

DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': os.getenv('COGNITO_REGION', 'us-east-1'),
    'COGNITO_CLIENT_ID': os.getenv('COGNITO_CLIENT_ID'),
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
    
    # v1.4.2 단순화된 설정
    'TOKEN_STORAGE': 'sessionStorage',
    'AUTO_AUTHORIZE': True,
    'CSRF_PROTECTION': True,
}
```

**환경 변수 설정**:
```bash
export COGNITO_REGION="us-east-1"
export COGNITO_CLIENT_ID="your-client-id"
export COGNITO_CLIENT_SECRET="your-client-secret"
```

### 6.3 CORS 설정 (필요시)

**settings.py**:
```python
# django-cors-headers 사용 시
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://api.yourdomain.com",
]
```

### 6.4 CSP 헤더 추가 (추가 보안)

```python
# django-csp 사용 시
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")  # Swagger UI 호환성
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
```

---

## 🛠️ Chapter 7: 문제 해결 및 디버깅

### 7.1 일반적인 문제들

#### 문제: 로그인 패널이 보이지 않음
**해결책**:
1. `drf_spectacular_auth`가 `INSTALLED_APPS`에 `drf_spectacular`보다 먼저 있는지 확인
2. `SpectacularAuthSwaggerView` 사용하는지 확인
3. 브라우저 캐시 삭제

#### 문제: 로그인 후 API 호출이 인증되지 않음
**해결책**:
1. `AUTO_AUTHORIZE: True` 설정 확인
2. CORS 설정 확인 (`CORS_ALLOW_CREDENTIALS = True`)
3. 쿠키 설정이 도메인과 맞는지 확인

#### 문제: 토큰이 저장되지 않음
**해결책**:
```python
# SessionStorage 확인 (브라우저 개발자 도구)
# Application → Session Storage → drf-spectacular-auth 항목 확인
```

### 7.2 디버깅 도구

**브라우저 개발자 도구 활용**:
1. **Network 탭**: HTTP 요청/응답 확인
2. **Application 탭**: Session Storage 토큰 저장 상태 확인
3. **Console 탭**: JavaScript 오류 확인

**Django 로깅 설정**:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'drf_spectacular_auth': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### 7.3 테스트 체크리스트

**로그인 프로세스 테스트**:
- [ ] 로그인 패널이 올바른 위치에 표시됨
- [ ] 유효한 자격증명으로 로그인 성공
- [ ] 로그인 후 UI가 "인증됨" 상태로 변경
- [ ] API 호출 시 Authorization 헤더 자동 적용
- [ ] 로그아웃 시 토큰이 정리됨

**SessionStorage 테스트**:
- [ ] SessionStorage에 토큰이 안전하게 저장됨
- [ ] 페이지 새로고침 후 인증 상태 유지
- [ ] 토큰 수동 복사 기능 동작 확인
- [ ] CSRF 보호 정상 동작 확인

---

## 📚 Chapter 8: 실제 사용 예제

### 8.1 완전한 Django 프로젝트 예제

**프로젝트 구조**:
```
myproject/
├── myproject/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── api/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
└── requirements.txt
```

**requirements.txt**:
```txt
Django>=4.2
djangorestframework>=3.12
drf-spectacular>=0.25.0
drf-spectacular-auth>=1.3.0
boto3>=1.20.0
```

**settings/base.py**:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'drf_spectacular_auth',
    'drf_spectacular',
    
    # Local apps
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'drf_spectacular_auth.middleware.SpectacularAuthMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'My API',
    'DESCRIPTION': 'API documentation with authentication',
    'VERSION': '1.0.0',
}
```

**settings/development.py**:
```python
from .base import *

DEBUG = True

DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'us-east-1',
    'COGNITO_CLIENT_ID': 'your-dev-client-id',
    
    # 개발 환경 설정 (v1.4.2)
    'TOKEN_STORAGE': 'sessionStorage',
    'AUTO_AUTHORIZE': True,
    'SHOW_COPY_BUTTON': True,
    'CSRF_PROTECTION': True,
    
    'THEME': {
        'PRIMARY_COLOR': '#007bff',
        'BACKGROUND_COLOR': '#f8f9fa',
    }
}
```

**settings/production.py**:
```python
from .base import *
import os

DEBUG = False

ALLOWED_HOSTS = ['api.yourdomain.com']

DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': os.getenv('COGNITO_REGION'),
    'COGNITO_CLIENT_ID': os.getenv('COGNITO_CLIENT_ID'),
    'COGNITO_CLIENT_SECRET': os.getenv('COGNITO_CLIENT_SECRET'),
    
    # 프로덕션 보안 설정 (v1.4.2)
    'TOKEN_STORAGE': 'sessionStorage',
    'AUTO_AUTHORIZE': True,
    'CSRF_PROTECTION': True,
    'REQUIRE_AUTHENTICATION': True,
    'SHOW_COPY_BUTTON': True,
}

# HTTPS 강제
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### 8.2 API 뷰 예제

**api/views.py**:
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    """인증이 필요한 API 엔드포인트"""
    return Response({
        'message': '인증된 사용자만 접근 가능',
        'user': request.user.email if hasattr(request.user, 'email') else str(request.user),
        'auth_method': 'Cognito JWT Token'
    })

@api_view(['GET'])
def public_view(request):
    """공개 API 엔드포인트"""
    return Response({
        'message': '누구나 접근 가능한 API',
        'authenticated': request.user.is_authenticated
    })
```

---

## 🎉 마무리

축하합니다! 이제 DRF Spectacular Auth의 모든 기능을 마스터했습니다.

### 📋 학습한 내용 요약

✅ **기본 설치 및 설정** - 5분 내 구동  
✅ **AWS Cognito 연동** - 실제 인증 구현  
✅ **SessionStorage 토큰 관리** - 단순하고 안정적인 인증 방식  
✅ **UI 커스터마이징** - 브랜드에 맞는 디자인  
✅ **고급 통합** - Django와의 완벽한 연동  
✅ **프로덕션 배포** - 엔터프라이즈급 보안 적용  

### 🚀 다음 단계

1. **실제 프로젝트 적용**: 학습한 내용을 실제 프로젝트에 적용해보세요
2. **커뮤니티 참여**: [GitHub Issues](https://github.com/CodeMath/drf-spectacular-auth/issues)에서 질문하고 피드백을 공유하세요
3. **기여하기**: 버그 리포트나 새로운 기능 제안으로 프로젝트에 기여해보세요

### 📚 추가 자료

- [공식 문서](https://github.com/CodeMath/drf-spectacular-auth#readme)
- [마이그레이션 가이드](HTTPONLY_COOKIE_MIGRATION.md)
- [개발 회고록](DEVELOPMENT_RETROSPECTIVE.md)
- [변경 로그](CHANGELOG.md)

### 💬 도움이 필요하신가요?

문제가 생기면 언제든지 다음 체크리스트를 확인해보세요:

1. **문서 재확인**: 설정을 단계별로 다시 확인
2. **브라우저 도구**: Network/Console 탭에서 오류 확인
3. **GitHub Issues**: 비슷한 문제가 이미 해결되었는지 검색
4. **새 이슈 생성**: 위 방법으로 해결되지 않으면 이슈 생성

---

**Happy Coding! 🎯**

*이 튜토리얼이 도움이 되었다면 ⭐ 스타를 눌러주세요!*