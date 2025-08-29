# DRF Spectacular Auth Examples

이 폴더는 `drf-spectacular-auth` 패키지의 다양한 사용법을 보여주는 예시들을 포함합니다.

## 📁 예시 구성

- **basic_usage/**: 기본적인 Django + DRF + Swagger UI 설정
- **cognito_integration/**: AWS Cognito와의 통합 예시
- **custom_theming/**: 사용자 정의 테마 적용 예시
- **hooks_example/**: 로그인/로그아웃 훅 사용법

## 🚀 빠른 시작

각 예시 폴더로 이동하여 해당 README를 참조하세요.

```bash
cd examples/basic_usage
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

브라우저에서 `http://localhost:8000/docs/`에 접속하여 인증이 통합된 Swagger UI를 확인할 수 있습니다.

## 📋 주요 기능

✅ **AWS Cognito 통합**: 완전 관리형 인증 서비스  
✅ **자동 토큰 관리**: Access Token과 Refresh Token 자동 처리  
✅ **사용자 정의 가능**: 테마, 위치, 스타일 커스터마이징  
✅ **다국어 지원**: 한국어, 영어, 일본어 지원  
✅ **확장 가능**: 커스텀 인증 프로바이더 지원  
✅ **보안**: CSRF 보호와 안전한 토큰 저장