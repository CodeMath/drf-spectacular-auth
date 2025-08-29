"""
Authentication hooks for example project.

이 파일은 drf-spectacular-auth의 훅 시스템 사용법을 보여줍니다.
"""
import logging
from typing import Dict, Any
from django.http import HttpRequest

logger = logging.getLogger(__name__)


def pre_login_hook(request: HttpRequest, credentials: Dict[str, Any]) -> None:
    """
    로그인 전에 실행되는 훅
    
    Args:
        request: Django HttpRequest 객체
        credentials: 사용자가 입력한 로그인 정보 (email, password)
    """
    email = credentials.get('email', 'Unknown')
    client_ip = get_client_ip(request)
    
    logger.info(f"Login attempt from {client_ip} for user: {email}")
    
    # 추가적인 보안 검사나 로깅을 여기에 구현할 수 있습니다
    # 예: 로그인 시도 횟수 제한, IP 화이트리스트 검사 등


def post_login_hook(request: HttpRequest, auth_result: Dict[str, Any]) -> None:
    """
    로그인 성공 후 실행되는 훅
    
    Args:
        request: Django HttpRequest 객체
        auth_result: 인증 결과 (access_token, user 정보 등)
    """
    user_info = auth_result.get('user', {})
    email = user_info.get('email', 'Unknown')
    client_ip = get_client_ip(request)
    
    logger.info(f"Successful login from {client_ip} for user: {email}")
    
    # 로그인 성공 후 추가 작업
    # 예: 사용자 활동 로그, 알림 발송, 세션 정리 등
    
    # 사용자 정의 세션 데이터 추가 (선택사항)
    if hasattr(request, 'session'):
        request.session['last_login_ip'] = client_ip
        request.session['cognito_user_id'] = user_info.get('sub')


def post_logout_hook(request: HttpRequest, data: Dict[str, Any]) -> None:
    """
    로그아웃 후 실행되는 훅
    
    Args:
        request: Django HttpRequest 객체
        data: 로그아웃 관련 데이터 (현재는 빈 딕셔너리)
    """
    client_ip = get_client_ip(request)
    user_email = getattr(request.user, 'email', 'Unknown') if hasattr(request, 'user') else 'Unknown'
    
    logger.info(f"User logout from {client_ip}: {user_email}")
    
    # 로그아웃 후 정리 작업
    # 예: 세션 정리, 임시 데이터 삭제, 로그아웃 통계 등
    
    if hasattr(request, 'session'):
        # 커스텀 세션 데이터 정리
        request.session.pop('last_login_ip', None)
        request.session.pop('cognito_user_id', None)


def get_client_ip(request: HttpRequest) -> str:
    """
    클라이언트 IP 주소를 가져옵니다
    
    Args:
        request: Django HttpRequest 객체
        
    Returns:
        str: 클라이언트 IP 주소
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip