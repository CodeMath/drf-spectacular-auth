// DRF Spectacular Auth Panel JavaScript - Simplified Version
(function() {
    'use strict';

    // Configuration from Django template
    const CONFIG = {
        loginUrl: '{{ login_url }}',
        logoutUrl: '{{ logout_url }}',
        csrfToken: '{{ csrf_token }}',
        language: '{{ language }}',
        autoAuthorize: {{ auth_settings.AUTO_AUTHORIZE|yesno:"true,false" }},
        showCopyButton: {{ auth_settings.SHOW_COPY_BUTTON|yesno:"true,false" }},
        tokenStorage: '{{ auth_settings.TOKEN_STORAGE }}', // sessionStorage or localStorage
        theme: {{ theme|safe }}
    };

    // Localized messages
    const MESSAGES = {
        ko: {
            loginInProgress: '로그인 중...',
            loginSuccess: '로그인에 성공했습니다!',
            loginFailed: '로그인에 실패했습니다.',
            networkError: '네트워크 오류가 발생했습니다.',
            logoutSuccess: '로그아웃되었습니다.',
            tokenCopied: '토큰이 클립보드에 복사되었습니다!',
            tokenCopyFailed: '토큰 복사에 실패했습니다. 수동으로 복사하세요.',
            noTokenToCopy: '복사할 토큰이 없습니다.',
            copied: '✅ 복사됨',
            unauthenticated: '미인증',
            authenticated: '인증됨',
            login: '로그인',
            logout: '로그아웃',
            copyToken: '토큰 복사',
            manualCopyTitle: '액세스 토큰 수동 복사',
            manualCopyDesc: '아래 토큰을 선택하여 복사한 후, Swagger UI의 Authorization 대화상자에 붙여넣으세요.',
            close: '닫기'
        },
        en: {
            loginInProgress: 'Logging in...',
            loginSuccess: 'Login successful!',
            loginFailed: 'Login failed.',
            networkError: 'Network error occurred.',
            logoutSuccess: 'Logout successful.',
            tokenCopied: 'Token copied to clipboard!',
            tokenCopyFailed: 'Failed to copy token. Please copy manually.',
            noTokenToCopy: 'No token to copy.',
            copied: '✅ Copied',
            unauthenticated: 'Unauthenticated',
            authenticated: 'Authenticated',
            login: 'Login',
            logout: 'Logout',
            copyToken: 'Copy Token',
            manualCopyTitle: 'Manual Access Token Copy',
            manualCopyDesc: 'Select and copy the token below, then paste it in the Swagger UI Authorization dialog.',
            close: 'Close'
        },
        ja: {
            loginInProgress: 'ログイン中...',
            loginSuccess: 'ログインに成功しました！',
            loginFailed: 'ログインに失敗しました。',
            networkError: 'ネットワークエラーが発生しました。',
            logoutSuccess: 'ログアウトしました。',
            tokenCopied: 'トークンがクリップボードにコピーされました！',
            tokenCopyFailed: 'トークンのコピーに失敗しました。手動でコピーしてください。',
            noTokenToCopy: 'コピーするトークンがありません。',
            copied: '✅ コピー済み',
            unauthenticated: '未認証',
            authenticated: '認証済み',
            login: 'ログイン',
            logout: 'ログアウト',
            copyToken: 'トークンをコピー',
            manualCopyTitle: 'アクセストークン手動コピー',
            manualCopyDesc: '下のトークンを選択してコピーし、Swagger UIのAuthorization ダイアログに貼り付けてください。',
            close: '閉じる'
        }
    };

    function getMessage(key) {
        return MESSAGES[CONFIG.language]?.[key] || MESSAGES.en[key] || key;
    }

    // Storage utility - simple sessionStorage/localStorage
    function getStorage() {
        return CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
    }

    function storeToken(token) {
        const storage = getStorage();
        storage.setItem('drf_auth_access_token', token);
        console.log(`🔒 Token stored in ${CONFIG.tokenStorage}:`, token ? 'YES' : 'NO');
    }

    function getStoredToken() {
        const storage = getStorage();
        const token = storage.getItem('drf_auth_access_token');
        console.log(`🔍 Token retrieved from ${CONFIG.tokenStorage}:`, token ? 'YES' : 'NO');
        return token;
    }

    function storeUserInfo(userInfo) {
        const storage = getStorage();
        storage.setItem('drf_auth_user_info', JSON.stringify(userInfo));
    }

    function getStoredUserInfo() {
        const storage = getStorage();
        const userInfo = storage.getItem('drf_auth_user_info');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    function clearStoredAuth() {
        const storage = getStorage();
        storage.removeItem('drf_auth_access_token');
        storage.removeItem('drf_auth_user_info');
    }

    // Simple Swagger authorization - basic preauthorizeApiKey
    function setSwaggerAuthorization(token) {
        if (window.ui && window.ui.preauthorizeApiKey) {
            try {
                // Try common scheme names
                const commonSchemes = ['BearerAuth', 'Bearer', 'JWT', 'CognitoJWT', 'ApiKeyAuth', 'TokenAuth'];
                
                for (const schemeName of commonSchemes) {
                    try {
                        window.ui.preauthorizeApiKey(schemeName, token);
                        console.log(`✅ Swagger authorization set with scheme: ${schemeName}`);
                        return true;
                    } catch (e) {
                        // Try next scheme
                    }
                }
                
                console.log('⚠️ Could not find compatible auth scheme, but token is available for manual copy');
                return false;
            } catch (error) {
                console.log('⚠️ Swagger UI not ready for authorization:', error.message);
                return false;
            }
        } else {
            console.log('⚠️ Swagger UI not available - token stored for manual copy');
            return false;
        }
    }

    function clearSwaggerAuthorization() {
        if (window.ui && window.ui.preauthorizeApiKey) {
            const commonSchemes = ['BearerAuth', 'Bearer', 'JWT', 'CognitoJWT', 'ApiKeyAuth', 'TokenAuth'];
            
            for (const schemeName of commonSchemes) {
                try {
                    window.ui.preauthorizeApiKey(schemeName, '');
                } catch (e) {
                    // Ignore errors when clearing
                }
            }
        }
    }

    // UI Update functions
    function updateAuthStatus(isAuthenticated, userEmail = '') {
        const authIndicator = document.querySelector('#auth-indicator');
        const authText = document.querySelector('#auth-text');
        const loginForm = document.querySelector('#login-form');
        const logoutBtn = document.querySelector('#logout-btn');
        const copyTokenBtn = document.querySelector('#copy-token-btn');

        if (isAuthenticated) {
            if (authIndicator) authIndicator.classList.add('authenticated');
            if (authText) authText.textContent = `${getMessage('authenticated')} (${userEmail})`;
            if (loginForm) loginForm.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (copyTokenBtn && CONFIG.showCopyButton) {
                copyTokenBtn.style.display = 'inline-block';
            }
        } else {
            if (authIndicator) authIndicator.classList.remove('authenticated');
            if (authText) authText.textContent = getMessage('unauthenticated');
            if (loginForm) loginForm.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (copyTokenBtn) copyTokenBtn.style.display = 'none';
        }
    }

    function showMessage(message, isError = false) {
        const messageEl = document.querySelector('#auth-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = isError ? 'auth-message error' : 'auth-message success';
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    // Login handler
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.querySelector('#auth-email').value;
        const password = document.querySelector('#auth-password').value;
        
        if (!email || !password) {
            showMessage(getMessage('loginFailed'), true);
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = getMessage('loginInProgress');
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('csrfmiddlewaretoken', CONFIG.csrfToken);

        fetch(CONFIG.loginUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': CONFIG.csrfToken,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                // Store token and user info
                storeToken(data.access_token);
                storeUserInfo(data.user);
                
                // Update UI
                updateAuthStatus(true, data.user.email);
                showMessage(getMessage('loginSuccess'));
                
                // Simple auto-authorization
                if (CONFIG.autoAuthorize) {
                    console.log('🎯 AUTO_AUTHORIZE enabled - attempting to set Swagger authorization');
                    setTimeout(() => {
                        const success = setSwaggerAuthorization(data.access_token);
                        if (success) {
                            console.log('✅ Swagger UI auto-authorization successful');
                        } else {
                            console.log('📋 Auto-authorization not available - use Copy Token button');
                        }
                    }, 1000);
                }
                
                // Clear form
                document.querySelector('#auth-email').value = '';
                document.querySelector('#auth-password').value = '';
                
            } else {
                showMessage(data.error || getMessage('loginFailed'), true);
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showMessage(getMessage('networkError'), true);
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // Logout handler
    function handleLogout() {
        fetch(CONFIG.logoutUrl, {
            method: 'POST',
            headers: {
                'X-CSRFToken': CONFIG.csrfToken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            // Clear stored auth
            clearStoredAuth();
            
            // Clear Swagger authorization
            clearSwaggerAuthorization();
            
            // Update UI
            updateAuthStatus(false);
            showMessage(getMessage('logoutSuccess'));
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Still clear local state even if server request fails
            clearStoredAuth();
            clearSwaggerAuthorization();
            updateAuthStatus(false);
        });
    }

    // Copy token handler
    function handleCopyToken() {
        const token = getStoredToken();
        
        if (!token) {
            showMessage(getMessage('noTokenToCopy'), true);
            return;
        }

        navigator.clipboard.writeText(token).then(function() {
            showMessage(getMessage('tokenCopied'));
            
            // Temporary visual feedback
            const copyBtn = document.querySelector('#copy-token-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = getMessage('copied');
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        }).catch(function(err) {
            console.error('Could not copy text:', err);
            showMessage(getMessage('tokenCopyFailed'), true);
            
            // Show manual copy modal
            showManualCopyModal(token);
        });
    }

    // Manual copy modal
    function showManualCopyModal(token) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal">
                <div class="auth-modal-header">
                    <h3>${getMessage('manualCopyTitle')}</h3>
                </div>
                <div class="auth-modal-content">
                    <p>${getMessage('manualCopyDesc')}</p>
                    <textarea readonly class="token-textarea" onclick="this.select()">${token}</textarea>
                </div>
                <div class="auth-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.auth-modal-overlay').remove()">
                        ${getMessage('close')}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('.token-textarea').select();
    }

    // Initialize
    function init() {
        console.log('🚀 Auth panel initializing...');
        console.log('📋 CONFIG:', {
            tokenStorage: CONFIG.tokenStorage,
            autoAuthorize: CONFIG.autoAuthorize,
            showCopyButton: CONFIG.showCopyButton
        });
        
        // Set up event listeners
        const loginForm = document.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        const logoutBtn = document.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        const copyTokenBtn = document.querySelector('#copy-token-btn');
        if (copyTokenBtn && CONFIG.showCopyButton) {
            copyTokenBtn.addEventListener('click', handleCopyToken);
        }

        // Check for existing authentication
        console.log('🔄 Checking for existing authentication...');
        const token = getStoredToken();
        const userInfo = getStoredUserInfo();

        if (token && userInfo) {
            console.log('✅ Found existing authentication, restoring login state');
            updateAuthStatus(true, userInfo.email);
            
            // Try auto-authorization if enabled
            if (CONFIG.autoAuthorize) {
                console.log('🎯 Auto-authorize enabled, setting Swagger authorization');
                setTimeout(() => {
                    setSwaggerAuthorization(token);
                }, 500);
            }
        } else {
            console.log('❌ No existing authentication found');
            updateAuthStatus(false);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();