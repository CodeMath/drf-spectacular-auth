# DRF Spectacular Auth - 기본 사용법 예시

이 예시는 `drf-spectacular-auth` 패키지의 기본적인 사용법을 보여주는 Django 프로젝트입니다.

## 🎯 주요 기능

- ✅ AWS Cognito를 통한 사용자 인증
- ✅ Swagger UI에 통합된 로그인 패널
- ✅ JWT 토큰 자동 관리
- ✅ 인증이 필요한 API와 공개 API 예시
- ✅ 커스텀 훅을 통한 확장성
- ✅ 한국어 지원 및 커스텀 테마

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. AWS Cognito 설정

AWS Cognito User Pool을 생성하고 다음 정보를 얻어주세요:

1. **Cognito Region**: 예) `ap-northeast-2` (서울)
2. **Client ID**: User Pool App Client의 ID

### 3. Django 설정

`example_project/settings.py`에서 다음 설정을 수정하세요:

```python
DRF_SPECTACULAR_AUTH = {
    'COGNITO_REGION': 'ap-northeast-2',  # 실제 리전으로 변경
    'COGNITO_CLIENT_ID': 'your-actual-client-id',  # 실제 Client ID로 변경
    
    # 나머지 설정은 그대로 사용 가능
}
```

### 4. 데이터베이스 마이그레이션

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. 슈퍼유저 생성 (선택사항)

```bash
python manage.py createsuperuser
```

### 6. 개발 서버 실행

```bash
python manage.py runserver
```

## 📖 사용법

### Swagger UI 접근

브라우저에서 `http://localhost:8000/docs/`에 접속하면 인증 패널이 통합된 Swagger UI를 볼 수 있습니다.

### 로그인 과정

1. Swagger UI 우측 상단의 **로그인** 버튼 클릭
2. AWS Cognito에 등록된 이메일과 비밀번호 입력
3. 로그인 성공 시 자동으로 Authorization 헤더 설정
4. 인증이 필요한 API 호출 가능

### API 엔드포인트

#### 공개 API (인증 불필요)
- `GET /api/health/` - API 상태 확인
- `GET /api/public/posts/` - 공개 블로그 포스트 목록

#### 인증이 필요한 API
- `GET /api/posts/` - 블로그 포스트 목록
- `POST /api/posts/` - 새 블로그 포스트 작성
- `GET /api/posts/{id}/` - 블로그 포스트 상세
- `GET /api/posts/my-posts/` - 내 블로그 포스트 목록
- `GET /api/user/profile/` - 사용자 프로필

#### 인증 API
- `POST /api/auth/login/` - 로그인
- `POST /api/auth/logout/` - 로그아웃

## 🎨 커스터마이징

### 테마 변경

`settings.py`의 `DRF_SPECTACULAR_AUTH` 설정에서 테마를 변경할 수 있습니다:

```python
'THEME': {
    'PRIMARY_COLOR': '#1976d2',     # 기본 색상
    'SUCCESS_COLOR': '#4caf50',     # 성공 색상
    'ERROR_COLOR': '#f44336',       # 에러 색상
    'BACKGROUND_COLOR': '#ffffff',  # 배경 색상
    'BORDER_RADIUS': '12px',        # 모서리 둥글기
    'SHADOW': '0 4px 20px rgba(25,118,210,0.15)',  # 그림자
    'FONT_FAMILY': '\"Noto Sans KR\", sans-serif',  # 폰트
},
```

### 패널 위치 변경

```python
'PANEL_POSITION': 'top-right',  # top-left, top-right, bottom-left, bottom-right
'PANEL_STYLE': 'floating',      # floating, embedded
```

### 언어 설정

```python
'DEFAULT_LANGUAGE': 'ko',       # ko(한국어), en(영어), ja(일본어)
'SUPPORTED_LANGUAGES': ['ko', 'en'],
```

## 🔧 훅 시스템

`example_project/hooks.py`에서 인증 과정의 각 단계에 대한 커스텀 로직을 추가할 수 있습니다:

- `pre_login_hook`: 로그인 전 실행
- `post_login_hook`: 로그인 성공 후 실행
- `post_logout_hook`: 로그아웃 후 실행

## 🐛 문제 해결

### 1. Cognito 설정 오류

```
ValueError: COGNITO_CLIENT_ID is required
```

`settings.py`에서 `COGNITO_CLIENT_ID`를 실제 값으로 설정했는지 확인하세요.

### 2. 인증 실패

```
AuthenticationError: Invalid email or password
```

- AWS Cognito에 등록된 사용자인지 확인
- 이메일 인증이 완료되었는지 확인
- Client ID와 Region이 올바른지 확인

### 3. 토큰 오류

```
AuthenticationError: Invalid or expired access token
```

- 로그아웃 후 다시 로그인
- 토큰 저장 설정 확인 (`TOKEN_STORAGE` 설정)

## 📚 추가 자료

- [AWS Cognito 사용자 가이드](https://docs.aws.amazon.com/cognito/)
- [Django REST Framework 문서](https://www.django-rest-framework.org/)
- [DRF Spectacular 문서](https://drf-spectacular.readthedocs.io/)

## 🤝 기여하기

버그 리포트나 기능 요청은 [GitHub Issues](https://github.com/CodeMath/drf-spectacular-auth/issues)에 올려주세요.