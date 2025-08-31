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
    }

    function getStoredToken() {
        const storage = getStorage();
        return storage.getItem('drf_auth_access_token');
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
                        // Successfully set authorization
                        return true;
                    } catch (e) {
                        // Try next scheme
                    }
                }
                
                return false;
            } catch (error) {
                return false;
            }
        } else {
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
        const authIndicator = document.querySelector('#drf-auth-indicator');
        const authText = document.querySelector('#drf-auth-text');
        const loginForm = document.querySelector('#drf-login-form');
        const logoutBtn = document.querySelector('#drf-logout-btn');
        const copyTokenBtn = document.querySelector('#drf-copy-token-btn');

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
            if (loginForm) loginForm.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (copyTokenBtn) copyTokenBtn.style.display = 'none';
        }
    }

    function showMessage(message, isError = false) {
        const messageEl = document.querySelector('#drf-status-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = isError ? 'drf-auth-message error' : 'drf-auth-message success';
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    // Login handler
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.querySelector('#drf-email').value;
        const password = document.querySelector('#drf-password').value;
        
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
                    setTimeout(() => {
                        setSwaggerAuthorization(data.access_token);
                    }, 1000);
                }
                
                // Clear form
                document.querySelector('#drf-email').value = '';
                document.querySelector('#drf-password').value = '';
                
            } else {
                showMessage(data.error || getMessage('loginFailed'), true);
            }
        })
        .catch(() => {
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
        .catch(() => {
            // Clear local state even if server request fails
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
            const copyBtn = document.querySelector('#drf-copy-token-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = getMessage('copied');
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        }).catch(function() {
            showMessage(getMessage('tokenCopyFailed'), true);
            showManualCopyModal(token);
        });
    }

    // Manual copy modal
    function showManualCopyModal(token) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 10000; display: flex;
            align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;">
                <h3 style="margin: 0 0 15px 0;">${getMessage('manualCopyTitle')}</h3>
                <p style="margin: 0 0 15px 0;">${getMessage('manualCopyDesc')}</p>
                <textarea readonly onclick="this.select()" 
                    style="width: 100%; height: 100px; margin-bottom: 15px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${token}</textarea>
                <button onclick="this.closest('div').parentElement.remove()" 
                    style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ${getMessage('close')}
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('textarea').select();
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Initialize
    function init() {
        // Set up event listeners
        const loginForm = document.querySelector('#drf-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        const logoutBtn = document.querySelector('#drf-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        const copyTokenBtn = document.querySelector('#drf-copy-token-btn');
        if (copyTokenBtn && CONFIG.showCopyButton) {
            copyTokenBtn.addEventListener('click', handleCopyToken);
        }

        // Check for existing authentication
        const token = getStoredToken();
        const userInfo = getStoredUserInfo();

        if (token && userInfo) {
            updateAuthStatus(true, userInfo.email);
            
            // Try auto-authorization if enabled
            if (CONFIG.autoAuthorize) {
                setTimeout(() => {
                    setSwaggerAuthorization(token);
                }, 500);
            }
        } else {
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