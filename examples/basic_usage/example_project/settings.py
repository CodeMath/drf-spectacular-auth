"""
Django settings for example_project.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production

SECRET_KEY = "django-insecure-example-key-for-demo-only"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "rest_framework",
    "drf_spectacular",
    "drf_spectacular_auth",  # 우리의 패키지
    # Local apps
    "api",  # 예시 API 앱
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "example_project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "example_project.wsgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "ko-kr"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django REST Framework 설정
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        # JWT 인증은 프론트엔드에서 Bearer 토큰으로 사용
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# DRF Spectacular 설정
SPECTACULAR_SETTINGS = {
    "TITLE": "DRF Spectacular Auth 예시 API",
    "DESCRIPTION": "AWS Cognito 인증이 통합된 Django REST API 예시",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # Swagger UI 설정
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
        "displayOperationId": False,
        "docExpansion": "none",
        "filter": True,
        "showMutatedRequest": True,
    },
    # 보안 스키마 설정
    "COMPONENT_SPLIT_REQUEST": True,
    "SORT_OPERATIONS": False,
}

# DRF Spectacular Auth 설정
DRF_SPECTACULAR_AUTH = {
    # AWS Cognito 설정
    "COGNITO_REGION": "ap-northeast-2",  # 서울 리전
    "COGNITO_CLIENT_ID": "your-cognito-client-id-here",  # 실제 값으로 변경 필요
    "COGNITO_CLIENT_SECRET": os.getenv(
        "COGNITO_CLIENT_SECRET"
    ),  # Private client인 경우에만 설정
    # UI 설정
    "PANEL_POSITION": "top-right",  # 인증 패널 위치
    "PANEL_STYLE": "floating",  # 패널 스타일
    "AUTO_AUTHORIZE": True,  # 자동 Authorization 헤더 추가
    "SHOW_COPY_BUTTON": True,  # 토큰 복사 버튼 표시
    "SHOW_USER_INFO": True,  # 사용자 정보 표시
    # 테마 설정
    "THEME": {
        "PRIMARY_COLOR": "#1976d2",  # 머티리얼 블루
        "SUCCESS_COLOR": "#4caf50",  # 머티리얼 그린
        "ERROR_COLOR": "#f44336",  # 머티리얼 레드
        "BACKGROUND_COLOR": "#ffffff",
        "BORDER_RADIUS": "12px",
        "SHADOW": "0 4px 20px rgba(25,118,210,0.15)",
        "FONT_FAMILY": '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
    },
    # 현지화 설정
    "DEFAULT_LANGUAGE": "ko",  # 기본 언어를 한국어로 설정
    "SUPPORTED_LANGUAGES": ["ko", "en"],
    # 보안 설정
    "TOKEN_STORAGE": "localStorage",  # localStorage 또는 sessionStorage
    "CSRF_PROTECTION": True,
    # 확장성 설정
    "HOOKS": {
        "PRE_LOGIN": "example_project.hooks.pre_login_hook",
        "POST_LOGIN": "example_project.hooks.post_login_hook",
        "PRE_LOGOUT": None,
        "POST_LOGOUT": "example_project.hooks.post_logout_hook",
    },
}

# 로깅 설정
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "drf_spectacular_auth": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
