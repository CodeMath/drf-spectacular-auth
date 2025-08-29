// DRF Spectacular Auth Panel JavaScript
(function() {
    'use strict';

    // Configuration from Django template
    const CONFIG = {
        loginUrl: '{{ login_url }}',
        csrfToken: '{{ csrf_token }}',
        language: '{{ language }}',
        autoAuthorize: {{ auth_settings.AUTO_AUTHORIZE|yesno:"true,false" }},
        showCopyButton: {{ auth_settings.SHOW_COPY_BUTTON|yesno:"true,false" }},
        tokenStorage: '{{ auth_settings.TOKEN_STORAGE }}',
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
            manualCopyTitle: 'Manual Token Copy',
            manualCopyDesc: 'Select and copy the token below, then paste it into the Swagger UI Authorization dialog.',
            close: 'Close'
        },
        ja: {
            loginInProgress: 'ログイン中...',
            loginSuccess: 'ログイン成功！',
            loginFailed: 'ログインに失敗しました。',
            networkError: 'ネットワークエラーが発生しました。',
            logoutSuccess: 'ログアウトしました。',
            tokenCopied: 'トークンをクリップボードにコピーしました！',
            tokenCopyFailed: 'トークンのコピーに失敗しました。手動でコピーしてください。',
            noTokenToCopy: 'コピーするトークンがありません。',
            copied: '✅ コピー済み',
            unauthenticated: '未認証',
            authenticated: '認証済み',
            login: 'ログイン',
            logout: 'ログアウト',
            copyToken: 'トークンコピー',
            manualCopyTitle: 'アクセストークンの手動コピー',
            manualCopyDesc: '下のトークンを選択してコピーし、Swagger UIの認証ダイアログに貼り付けてください。',
            close: '閉じる'
        }
    };

    // Get localized message
    function getMessage(key) {
        return MESSAGES[CONFIG.language] && MESSAGES[CONFIG.language][key] 
            ? MESSAGES[CONFIG.language][key] 
            : MESSAGES.en[key];
    }

    // Setup event listeners
    function setupEventListeners() {
        const loginForm = document.getElementById('drf-login-form');
        const loginBtn = document.getElementById('drf-login-btn');
        const logoutBtn = document.getElementById('drf-logout-btn');
        const copyTokenBtn = document.getElementById('drf-copy-token-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        if (copyTokenBtn && CONFIG.showCopyButton) {
            copyTokenBtn.addEventListener('click', handleCopyToken);
        }
    }

    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('drf-email').value;
        const password = document.getElementById('drf-password').value;
        const loginBtn = document.getElementById('drf-login-btn');
        
        loginBtn.disabled = true;
        loginBtn.textContent = getMessage('loginInProgress');
        
        try {
            const response = await fetch(CONFIG.loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CONFIG.csrfToken
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store tokens based on configuration
                const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
                storage.setItem('drf_auth_access_token', data.access_token);
                storage.setItem('drf_auth_user_info', JSON.stringify(data.user));
                
                updateAuthStatus(true, data.user.email);
                showMessage(data.message || getMessage('loginSuccess'), 'success');
                
                document.getElementById('drf-login-form').reset();
                
                if (CONFIG.autoAuthorize) {
                    setSwaggerAuthorization(data.access_token);
                }
            } else {
                showMessage(data.error || getMessage('loginFailed'), 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showMessage(getMessage('networkError'), 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = getMessage('login');
        }
    }

    // Handle logout
    function handleLogout() {
        const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
        storage.removeItem('drf_auth_access_token');
        storage.removeItem('drf_auth_user_info');
        
        updateAuthStatus(false);
        clearSwaggerAuthorization();
        showMessage(getMessage('logoutSuccess'), 'success');
    }

    // Handle token copy
    async function handleCopyToken() {
        const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
        const token = storage.getItem('drf_auth_access_token');
        
        if (!token) {
            showMessage(getMessage('noTokenToCopy'), 'error');
            return;
        }

        const copyTokenBtn = document.getElementById('drf-copy-token-btn');

        try {
            await navigator.clipboard.writeText(token);
            showMessage(getMessage('tokenCopied'), 'success');
            
            // Button feedback
            const originalText = copyTokenBtn.textContent;
            copyTokenBtn.textContent = getMessage('copied');
            copyTokenBtn.style.background = '#6c757d';
            
            setTimeout(() => {
                copyTokenBtn.textContent = originalText;
                copyTokenBtn.style.background = CONFIG.theme.SUCCESS_COLOR;
            }, 2000);
            
        } catch (err) {
            console.error('Token copy failed:', err);
            
            // Fallback method
            try {
                const textArea = document.createElement('textarea');
                textArea.value = token;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                showMessage(getMessage('tokenCopied'), 'success');
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
                showMessage(getMessage('tokenCopyFailed'), 'error');
                
                // Show manual copy modal
                showTokenForManualCopy(token);
            }
        }
    }

    // Update authentication status UI
    function updateAuthStatus(authenticated, userEmail = null) {
        const authIndicator = document.getElementById('drf-auth-indicator');
        const authText = document.getElementById('drf-auth-text');
        const loginForm = document.getElementById('drf-login-form');
        const logoutBtn = document.getElementById('drf-logout-btn');
        const copyTokenBtn = document.getElementById('drf-copy-token-btn');
        
        if (authenticated) {
            if (authIndicator) authIndicator.classList.add('authenticated');
            if (authText) {
                authText.textContent = userEmail 
                    ? `${getMessage('authenticated')} (${userEmail})` 
                    : getMessage('authenticated');
            }
            if (loginForm) loginForm.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (copyTokenBtn && CONFIG.showCopyButton) copyTokenBtn.style.display = 'inline-block';
        } else {
            if (authIndicator) authIndicator.classList.remove('authenticated');
            if (authText) authText.textContent = getMessage('unauthenticated');
            if (loginForm) loginForm.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (copyTokenBtn) copyTokenBtn.style.display = 'none';
        }
    }

    // Show status message
    function showMessage(message, type = 'error') {
        const statusMessage = document.getElementById('drf-status-message');
        if (!statusMessage) return;
        
        statusMessage.textContent = message;
        statusMessage.className = `drf-auth-message ${type}`;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }

    // Set Swagger authorization
    function setSwaggerAuthorization(token) {
        const checkUI = () => {
            if (window.ui && window.ui.preauthorizeApiKey) {
                window.ui.preauthorizeApiKey('BearerAuth', token);
                console.log('Swagger authorization set successfully');
                updateAuthorizationModal(token);
            } else {
                setTimeout(checkUI, 500);
            }
        };
        checkUI();
    }

    // Update authorization modal
    function updateAuthorizationModal(token) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && (node.classList.contains('modal-ux') || node.querySelector('.auth-container'))) {
                            setTimeout(() => fillAuthorizationFields(token), 100);
                        }
                        const authContainer = node.querySelector && node.querySelector('.auth-container, .scheme-container');
                        if (authContainer) {
                            setTimeout(() => fillAuthorizationFields(token), 100);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Authorization button click handler
        const observeAuthModal = () => {
            const authorizeBtn = document.querySelector('.authorize-wrapper .btn, .authorize');
            if (authorizeBtn) {
                const handleClick = () => setTimeout(() => fillAuthorizationFields(token), 300);
                authorizeBtn.removeEventListener('click', handleClick);
                authorizeBtn.addEventListener('click', handleClick);
            } else {
                setTimeout(observeAuthModal, 1000);
            }
        };

        observeAuthModal();
        window.drfAuthObserver = observer;
    }

    // Fill authorization fields
    function fillAuthorizationFields(token) {
        const selectors = [
            'input[placeholder*="Bearer"]',
            'input[data-name*="BearerAuth"]', 
            '.auth-container input[type="text"]',
            '.scheme-container input[type="text"]',
            'input[name*="Bearer"]'
        ];

        selectors.forEach(selector => {
            const inputs = document.querySelectorAll(selector);
            inputs.forEach(input => {
                const container = input.closest('.auth-container, .scheme-container, .modal-ux');
                if (container) {
                    const containerText = container.textContent || '';
                    if (containerText.includes('BearerAuth') || containerText.includes('Bearer') || containerText.includes('JWT')) {
                        input.value = token;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        });

        const authSections = document.querySelectorAll('.auth-container, .scheme-container, .security-definition');
        authSections.forEach(section => {
            const titleElements = section.querySelectorAll('h4, h5, .auth-type, .security-definition-description, label');
            titleElements.forEach(title => {
                if (title.textContent.includes('BearerAuth') || title.textContent.includes('Bearer')) {
                    const input = section.querySelector('input[type="text"], input[type="password"], input');
                    if (input && !input.readOnly) {
                        input.value = token;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        });
    }

    // Clear Swagger authorization
    function clearSwaggerAuthorization() {
        if (window.ui && window.ui.preauthorizeApiKey) {
            window.ui.preauthorizeApiKey('BearerAuth', '');
            console.log('Swagger authorization cleared');
        }

        fillAuthorizationFields('');
        
        if (window.drfAuthObserver) {
            window.drfAuthObserver.disconnect();
            window.drfAuthObserver = null;
        }
    }

    // Check existing authentication
    function checkExistingAuth() {
        const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
        const token = storage.getItem('drf_auth_access_token');
        const userInfo = storage.getItem('drf_auth_user_info');
        
        if (token && userInfo) {
            try {
                const user = JSON.parse(userInfo);
                updateAuthStatus(true, user.email);
                if (CONFIG.autoAuthorize) {
                    setSwaggerAuthorization(token);
                }
            } catch (error) {
                console.error('Error parsing user info:', error);
                storage.removeItem('drf_auth_access_token');
                storage.removeItem('drf_auth_user_info');
            }
        }
    }

    // Show manual copy modal
    function showTokenForManualCopy(token) {
        const existingModal = document.getElementById('drf-token-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'drf-token-modal';
        modal.className = 'drf-token-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'drf-token-modal-content';

        modalContent.innerHTML = `
            <h3>${getMessage('manualCopyTitle')}</h3>
            <p>${getMessage('manualCopyDesc')}</p>
            <textarea readonly class="drf-token-textarea">${token}</textarea>
            <div class="drf-token-modal-footer">
                <button id="drf-close-token-modal" class="drf-auth-button-secondary">
                    ${getMessage('close')}
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Auto-select textarea
        const textarea = modalContent.querySelector('textarea');
        textarea.focus();
        textarea.select();

        // Close button event
        const closeBtn = document.getElementById('drf-close-token-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        
        // Background click to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
        checkExistingAuth();
    });

    // Export for debugging (optional)
    window.drfSpectacularAuth = {
        updateAuthStatus,
        showMessage,
        checkExistingAuth
    };

})();