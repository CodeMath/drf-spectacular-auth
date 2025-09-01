# DRF Spectacular Auth Examples

이 폴더는 `drf-spectacular-auth` 패키지의 다양한 사용법을 보여주는 예시들을 포함합니다.

## 📁 예시 구성

- **basic_usage/**: 기본적인 Django + DRF + Swagger UI 설정 (v1.4.2 업데이트 완료)

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
✅ **SessionStorage 토큰 관리**: 간단하고 안정적인 클라이언트 사이드 토큰 저장  
✅ **자동 인증**: AUTO_AUTHORIZE로 Swagger UI 자동 인증 시도  
✅ **토큰 복사**: 수동 토큰 복사 기능으로 호환성 보장  
✅ **사용자 정의 가능**: 테마, 위치, 스타일 커스터마이징  
✅ **다국어 지원**: 한국어, 영어, 일본어 지원  
✅ **확장 가능**: 커스텀 인증 프로바이더 지원  
✅ **프로덕션 준비**: 안정적이고 maintainable한 코드베이스

## 🆕 v1.4.2 업데이트

- 🐛 로그인 폼 페이지 새로고침 버그 수정
- 🎯 HTML/JavaScript ID 매칭 문제 해결
- ⚡ 성능 최적화 및 코드 정리
- 🔄 인증 상태 지속성 개선