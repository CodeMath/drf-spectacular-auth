"""
Views for DRF Spectacular Auth
"""

import json
import logging
from typing import Any, Dict

from django.middleware.csrf import get_token
from django.utils.module_loading import import_string
from drf_spectacular.utils import extend_schema
from drf_spectacular.views import SpectacularSwaggerView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .conf import auth_settings
from .providers.base import AuthenticationError
from .providers.cognito import CognitoAuthProvider
from .serializers import (
    ErrorResponseSerializer,
    LoginResponseSerializer,
    LoginSerializer,
)

logger = logging.getLogger(__name__)


class SpectacularAuthSwaggerView(SpectacularSwaggerView):
    """
    Minimal SpectacularSwaggerView extension that injects auth panel via JavaScript
    
    This approach:
    1. Uses a simple template with JavaScript injection
    2. Injects auth panel dynamically via JavaScript
    3. No complex template inheritance issues
    4. Minimal code footprint
    """

    template_name = "drf_spectacular_auth/simple_swagger_ui.html"

    def dispatch(self, request, *args, **kwargs):
        """
        Check authentication requirements before rendering
        """
        if auth_settings.REQUIRE_AUTHENTICATION and not request.user.is_authenticated:
            # Could redirect to login or show auth panel prominently
            pass
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        # Get original context from parent
        context = super().get_context_data(**kwargs)
        
        # Prepare auth configuration for JavaScript injection
        auth_config = {
            'loginUrl': auth_settings.LOGIN_ENDPOINT,
            'logoutUrl': auth_settings.LOGOUT_ENDPOINT,
            'csrfToken': get_token(self.request),
            'language': self._get_language(),
            'settings': {
                'PANEL_POSITION': auth_settings.PANEL_POSITION,
                'PANEL_STYLE': auth_settings.PANEL_STYLE,
                'AUTO_AUTHORIZE': auth_settings.AUTO_AUTHORIZE,
                'SHOW_COPY_BUTTON': auth_settings.SHOW_COPY_BUTTON,
                'SHOW_USER_INFO': auth_settings.SHOW_USER_INFO,
                'TOKEN_STORAGE': auth_settings.TOKEN_STORAGE,
                'THEME': auth_settings.THEME,
            }
        }
        
        # Add JavaScript injection script to context
        context['drf_auth_config'] = json.dumps(auth_config, ensure_ascii=False)
        context['drf_auth_inject_script'] = self._generate_injection_script()
        
        return context

    def _get_language(self) -> str:
        """Get current language from request or settings"""
        language = getattr(self.request, "LANGUAGE_CODE", None)
        if not language or language not in auth_settings.SUPPORTED_LANGUAGES:
            language = auth_settings.DEFAULT_LANGUAGE
        return language

    def _generate_injection_script(self) -> str:
        """
        Generate JavaScript that will inject the auth panel into the page
        """
        return """
        <script>
        (function() {
            'use strict';
            
            // Wait for page to load
            window.addEventListener('load', function() {
                // Wait a bit more for Swagger UI to fully initialize
                setTimeout(function() {
                    injectDRFAuthPanel();
                }, 500);
            });
            
            function injectDRFAuthPanel() {
                // Get config from Django
                const config = JSON.parse(document.querySelector('#drf-auth-config').textContent);
                
                // Create auth panel HTML
                const panelHtml = createAuthPanelHTML(config);
                
                // Create auth panel styles  
                const styles = createAuthPanelStyles(config);
                
                // Inject styles
                const styleElement = document.createElement('style');
                styleElement.textContent = styles;
                document.head.appendChild(styleElement);
                
                // Inject panel
                const panelElement = document.createElement('div');
                panelElement.innerHTML = panelHtml;
                document.body.appendChild(panelElement.firstElementChild);
                
                // Initialize auth panel functionality
                initializeAuthPanel(config);
            }
            
            function createAuthPanelHTML(config) {
                const messages = getMessages(config.language);
                const position = getPositionStyle(config.settings.PANEL_POSITION);
                
                return `
                <div id="drf-auth-panel" class="drf-auth-panel" style="${position}">
                    <h3>🔐 ${messages.title}</h3>
                    <div id="drf-auth-status" class="drf-auth-status">
                        <div id="drf-auth-indicator" class="drf-auth-indicator"></div>
                        <span id="drf-auth-text" class="drf-auth-text">${messages.unauthenticated}</span>
                        <button id="drf-copy-token-btn" class="drf-auth-button drf-auth-button-copy" style="display:none;">
                            📋 ${messages.copyToken}
                        </button>
                        <button id="drf-logout-btn" class="drf-auth-button drf-auth-button-logout" style="display:none;">
                            ${messages.logout}
                        </button>
                    </div>
                    <div id="drf-status-message" class="drf-auth-message" style="display:none;"></div>
                    <form id="drf-login-form" class="drf-auth-form">
                        <input type="email" id="drf-email" class="drf-auth-input" placeholder="${messages.emailPlaceholder}" required>
                        <input type="password" id="drf-password" class="drf-auth-input" placeholder="${messages.passwordPlaceholder}" required>
                        <button type="submit" id="drf-login-btn" class="drf-auth-button-primary">${messages.login}</button>
                    </form>
                </div>
                `;
            }
            
            function createAuthPanelStyles(config) {
                const theme = config.settings.THEME;
                return `
                .drf-auth-panel {
                    position: fixed;
                    background: ${theme.BACKGROUND_COLOR};
                    border: 1px solid #ddd;
                    border-radius: ${theme.BORDER_RADIUS};
                    padding: 20px;
                    box-shadow: ${theme.SHADOW};
                    z-index: 9999;
                    min-width: 300px;
                    font-family: ${theme.FONT_FAMILY};
                }
                .drf-auth-panel h3 {
                    font-size: 14px;
                    font-weight: bold;
                    margin: 0 0 12px 0;
                    color: #333;
                }
                .drf-auth-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }
                .drf-auth-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${theme.ERROR_COLOR};
                }
                .drf-auth-indicator.authenticated {
                    background: ${theme.SUCCESS_COLOR};
                }
                .drf-auth-text {
                    flex: 1;
                }
                .drf-auth-button {
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-left: 4px;
                }
                .drf-auth-button-copy {
                    background: ${theme.SUCCESS_COLOR};
                    color: white;
                }
                .drf-auth-button-logout {
                    background: ${theme.ERROR_COLOR};
                    color: white;
                }
                .drf-auth-message {
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    text-align: center;
                    margin-bottom: 12px;
                }
                .drf-auth-message.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                .drf-auth-message.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                .drf-auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .drf-auth-input {
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .drf-auth-button-primary {
                    background: ${theme.PRIMARY_COLOR};
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .drf-auth-button-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                `;
            }
            
            function getPositionStyle(position) {
                const positions = {
                    'top-left': 'top: 20px; left: 20px;',
                    'top-right': 'top: 20px; right: 20px;',
                    'bottom-left': 'bottom: 20px; left: 20px;',
                    'bottom-right': 'bottom: 20px; right: 20px;'
                };
                return positions[position] || positions['top-right'];
            }
            
            function getMessages(language) {
                const messages = {
                    ko: {
                        title: 'Cognito 로그인',
                        unauthenticated: '미인증',
                        authenticated: '인증됨',
                        login: '로그인',
                        logout: '로그아웃',
                        copyToken: '토큰 복사',
                        emailPlaceholder: '이메일',
                        passwordPlaceholder: '패스워드',
                        loginInProgress: '로그인 중...',
                        loginSuccess: '로그인에 성공했습니다!',
                        loginFailed: '로그인에 실패했습니다.',
                        logoutSuccess: '로그아웃되었습니다.',
                        tokenCopied: '토큰이 클립보드에 복사되었습니다!'
                    },
                    en: {
                        title: 'Cognito Login',
                        unauthenticated: 'Unauthenticated',
                        authenticated: 'Authenticated',
                        login: 'Login',
                        logout: 'Logout',
                        copyToken: 'Copy Token',
                        emailPlaceholder: 'Email',
                        passwordPlaceholder: 'Password',
                        loginInProgress: 'Logging in...',
                        loginSuccess: 'Login successful!',
                        loginFailed: 'Login failed.',
                        logoutSuccess: 'Logout successful.',
                        tokenCopied: 'Token copied to clipboard!'
                    },
                    ja: {
                        title: 'Cognito ログイン',
                        unauthenticated: '未認証',
                        authenticated: '認証済み',
                        login: 'ログイン',
                        logout: 'ログアウト',
                        copyToken: 'トークンコピー',
                        emailPlaceholder: 'メール',
                        passwordPlaceholder: 'パスワード',
                        loginInProgress: 'ログイン中...',
                        loginSuccess: 'ログイン成功！',
                        loginFailed: 'ログインに失敗しました。',
                        logoutSuccess: 'ログアウトしました。',
                        tokenCopied: 'トークンをクリップボードにコピーしました！'
                    }
                };
                return messages[language] || messages.en;
            }
            
            function initializeAuthPanel(config) {
                const messages = getMessages(config.language);
                
                // Login form handler
                const loginForm = document.getElementById('drf-login-form');
                loginForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('drf-email').value;
                    const password = document.getElementById('drf-password').value;
                    const loginBtn = document.getElementById('drf-login-btn');
                    
                    loginBtn.disabled = true;
                    loginBtn.textContent = messages.loginInProgress;
                    
                    try {
                        const response = await fetch(config.loginUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': config.csrfToken
                            },
                            body: JSON.stringify({ email, password })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            // Store token
                            const storage = config.settings.TOKEN_STORAGE === 'sessionStorage' ? sessionStorage : localStorage;
                            storage.setItem('drf_auth_access_token', data.access_token);
                            storage.setItem('drf_auth_user_info', JSON.stringify(data.user));
                            
                            updateAuthStatus(true, data.user.email, config, messages);
                            showMessage(data.message || messages.loginSuccess, 'success');
                            
                            loginForm.reset();
                            
                            // Auto authorize Swagger if enabled
                            if (config.settings.AUTO_AUTHORIZE) {
                                setSwaggerAuthorization(data.access_token);
                            }
                        } else {
                            showMessage(data.error || messages.loginFailed, 'error');
                        }
                        
                    } catch (error) {
                        console.error('Login error:', error);
                        showMessage('Network error occurred.', 'error');
                    } finally {
                        loginBtn.disabled = false;
                        loginBtn.textContent = messages.login;
                    }
                });
                
                // Logout handler
                document.getElementById('drf-logout-btn').addEventListener('click', function() {
                    const storage = config.settings.TOKEN_STORAGE === 'sessionStorage' ? sessionStorage : localStorage;
                    storage.removeItem('drf_auth_access_token');
                    storage.removeItem('drf_auth_user_info');
                    
                    updateAuthStatus(false, null, config, messages);
                    clearSwaggerAuthorization();
                    showMessage(messages.logoutSuccess, 'success');
                });
                
                // Copy token handler
                document.getElementById('drf-copy-token-btn').addEventListener('click', async function() {
                    const storage = config.settings.TOKEN_STORAGE === 'sessionStorage' ? sessionStorage : localStorage;
                    const token = storage.getItem('drf_auth_access_token');
                    
                    if (token) {
                        try {
                            await navigator.clipboard.writeText(token);
                            showMessage(messages.tokenCopied, 'success');
                        } catch (err) {
                            console.error('Token copy failed:', err);
                        }
                    }
                });
                
                // Check existing auth
                checkExistingAuth(config, messages);
            }
            
            function updateAuthStatus(authenticated, userEmail, config, messages) {
                const authIndicator = document.getElementById('drf-auth-indicator');
                const authText = document.getElementById('drf-auth-text');
                const loginForm = document.getElementById('drf-login-form');
                const logoutBtn = document.getElementById('drf-logout-btn');
                const copyTokenBtn = document.getElementById('drf-copy-token-btn');
                
                if (authenticated) {
                    authIndicator.classList.add('authenticated');
                    authText.textContent = userEmail ? `${messages.authenticated} (${userEmail})` : messages.authenticated;
                    loginForm.style.display = 'none';
                    logoutBtn.style.display = 'inline-block';
                    if (config.settings.SHOW_COPY_BUTTON) {
                        copyTokenBtn.style.display = 'inline-block';
                    }
                } else {
                    authIndicator.classList.remove('authenticated');
                    authText.textContent = messages.unauthenticated;
                    loginForm.style.display = 'flex';
                    logoutBtn.style.display = 'none';
                    copyTokenBtn.style.display = 'none';
                }
            }
            
            function showMessage(message, type) {
                const statusMessage = document.getElementById('drf-status-message');
                statusMessage.textContent = message;
                statusMessage.className = `drf-auth-message ${type}`;
                statusMessage.style.display = 'block';
                
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 5000);
            }
            
            function setSwaggerAuthorization(token) {
                const checkUI = () => {
                    if (window.ui && window.ui.preauthorizeApiKey) {
                        window.ui.preauthorizeApiKey('BearerAuth', token);
                        console.log('Swagger authorization set successfully');
                    } else {
                        setTimeout(checkUI, 500);
                    }
                };
                checkUI();
            }
            
            function clearSwaggerAuthorization() {
                if (window.ui && window.ui.preauthorizeApiKey) {
                    window.ui.preauthorizeApiKey('BearerAuth', '');
                }
            }
            
            function checkExistingAuth(config, messages) {
                const storage = config.settings.TOKEN_STORAGE === 'sessionStorage' ? sessionStorage : localStorage;
                const token = storage.getItem('drf_auth_access_token');
                const userInfo = storage.getItem('drf_auth_user_info');
                
                if (token && userInfo) {
                    try {
                        const user = JSON.parse(userInfo);
                        updateAuthStatus(true, user.email, config, messages);
                        if (config.settings.AUTO_AUTHORIZE) {
                            setSwaggerAuthorization(token);
                        }
                    } catch (error) {
                        console.error('Error parsing user info:', error);
                        storage.removeItem('drf_auth_access_token');
                        storage.removeItem('drf_auth_user_info');
                    }
                }
            }
            
        })();
        </script>
        <script id="drf-auth-config" type="application/json">{drf_auth_config}</script>
        """.replace('{drf_auth_config}', '{{ drf_auth_config|safe }}')


@extend_schema(exclude=True)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    API endpoint for user authentication
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            ErrorResponseSerializer(
                {"error": "Invalid request data", "detail": str(serializer.errors)}
            ).data,
            status=status.HTTP_400_BAD_REQUEST,
        )

    credentials = serializer.validated_data

    try:
        # Get authentication provider
        provider = _get_auth_provider()

        # Validate credentials
        if not provider.validate_credentials(credentials):
            return Response(
                ErrorResponseSerializer(
                    {
                        "error": "Invalid credentials format",
                        "detail": "Please check your email and password format",
                    }
                ).data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call pre-login hook if configured
        _call_hook("PRE_LOGIN", request, credentials)

        # Authenticate user
        auth_result = provider.authenticate(credentials)

        # Call post-login hook if configured
        _call_hook("POST_LOGIN", request, auth_result)

        logger.info(f"Successful login for user: {credentials.get('email')}")

        # Store token in session for middleware-based auth
        request.session["spectacular_auth_token"] = auth_result["access_token"]
        request.session["spectacular_user_email"] = credentials.get("email")

        return Response(
            LoginResponseSerializer(auth_result).data, status=status.HTTP_200_OK
        )

    except AuthenticationError as e:
        logger.warning(f"Authentication failed: {e.message}")
        return Response(
            ErrorResponseSerializer({"error": e.message, "detail": e.detail}).data,
            status=status.HTTP_401_UNAUTHORIZED,
        )

    except Exception as e:
        logger.error(f"Unexpected error during authentication: {str(e)}")
        return Response(
            ErrorResponseSerializer(
                {
                    "error": "Authentication service error",
                    "detail": "An unexpected error occurred during authentication",
                }
            ).data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@extend_schema(exclude=True)
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """
    API endpoint for user logout
    """
    try:
        # Call pre-logout hook if configured
        _call_hook("PRE_LOGOUT", request, {})

        # Clear session data
        if "spectacular_auth_token" in request.session:
            del request.session["spectacular_auth_token"]
        if "spectacular_user_email" in request.session:
            del request.session["spectacular_user_email"]

        # Call post-logout hook if configured
        _call_hook("POST_LOGOUT", request, {})

        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        return Response(
            ErrorResponseSerializer(
                {"error": "Logout failed", "detail": "An error occurred during logout"}
            ).data,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def _get_auth_provider():
    """
    Get the configured authentication provider
    """
    # For now, we only support Cognito
    # This can be extended to support multiple providers
    return CognitoAuthProvider()


def _call_hook(hook_name: str, request, data: Dict[str, Any]) -> None:
    """
    Call a configured hook function
    """
    hook_path = auth_settings.HOOKS.get(hook_name)
    if not hook_path:
        return

    try:
        hook_func = import_string(hook_path)
        hook_func(request, data)
    except Exception as e:
        logger.error(f"Error calling {hook_name} hook: {str(e)}")
