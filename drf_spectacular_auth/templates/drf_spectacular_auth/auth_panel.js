// DRF Spectacular Auth Panel JavaScript
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
        tokenStorage: '{{ auth_settings.TOKEN_STORAGE }}',
        useHttpOnlyCookie: {{ auth_settings.USE_HTTPONLY_COOKIE|yesno:"true,false" }},
        theme: {{ theme|safe }}
    };
    
    // Debug: Log CONFIG at startup
    console.log('🔧 DRF-SPECTACULAR-AUTH CONFIG:', CONFIG);

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

    // Cookie utility functions
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return decodeURIComponent(parts.pop().split(';').shift());
        }
        return null;
    }

    function getTokenFromStorage() {
        // Try HttpOnly cookie approach first (if enabled)
        if (CONFIG.useHttpOnlyCookie) {
            // HttpOnly cookie cannot be accessed by JavaScript
            // Token is handled server-side, so we don't need it here
            // Just check if user_email cookie exists to verify auth status
            return getCookie('user_email') ? 'httponly_token' : null;
        }
        
        // Fallback to localStorage/sessionStorage
        const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
        return storage.getItem('drf_auth_access_token');
    }

    function getUserInfoFromStorage() {
        // Try cookie approach first (if enabled)
        if (CONFIG.useHttpOnlyCookie) {
            const userEmail = getCookie('user_email');
            return userEmail ? { email: userEmail } : null;
        }
        
        // Fallback to localStorage/sessionStorage
        const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
        const userInfo = storage.getItem('drf_auth_user_info');
        return userInfo ? JSON.parse(userInfo) : null;
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
            console.log('Login response:', data);
            
            if (response.ok) {
                // HttpOnly cookies are set by server automatically
                // Only store in client storage if not using HttpOnly cookies
                if (!CONFIG.useHttpOnlyCookie) {
                    const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
                    storage.setItem('drf_auth_access_token', data.access_token);
                    storage.setItem('drf_auth_user_info', JSON.stringify(data.user));
                }
                
                updateAuthStatus(true, data.user.email);
                showMessage(data.message || getMessage('loginSuccess'), 'success');
                
                document.getElementById('drf-login-form').reset();
                
                // Auto-authorize Swagger UI if enabled
                console.log('🔍 LOGIN SUCCESS - Starting AUTO_AUTHORIZE check');
                console.log('CONFIG.autoAuthorize:', CONFIG.autoAuthorize);
                console.log('CONFIG.useHttpOnlyCookie:', CONFIG.useHttpOnlyCookie);
                console.log('Login response data:', data);
                
                if (CONFIG.autoAuthorize) {
                    console.log('✅ AUTO_AUTHORIZE is enabled');
                    
                    // Use swagger_token for HttpOnly cookie mode, access_token for storage mode
                    const tokenForSwagger = CONFIG.useHttpOnlyCookie ? 
                        data.swagger_token : data.access_token;
                    
                    console.log('Token for Swagger:', tokenForSwagger ? 'EXISTS' : 'MISSING');
                    console.log('Expected token field:', CONFIG.useHttpOnlyCookie ? 'swagger_token' : 'access_token');
                    
                    if (tokenForSwagger) {
                        console.log('🚀 Calling setSwaggerAuthorization with token');
                        setSwaggerAuthorization(tokenForSwagger);
                        
                        // Security: Clear swagger_token from memory after use (HttpOnly mode)
                        if (CONFIG.useHttpOnlyCookie && data.swagger_token) {
                            console.log('🧹 Clearing swagger_token from memory');
                            delete data.swagger_token;
                        }
                    } else {
                        console.error('❌ NO TOKEN AVAILABLE for AUTO_AUTHORIZE');
                        console.error('Available data keys:', Object.keys(data));
                        if (CONFIG.useHttpOnlyCookie) {
                            console.error('Expected: data.swagger_token (HttpOnly mode)');
                        } else {
                            console.error('Expected: data.access_token (storage mode)');
                        }
                    }
                } else {
                    console.log('❌ AUTO_AUTHORIZE is disabled in CONFIG');
                }
            } else {
                console.error('❌ LOGIN FAILED');
                console.error('Response status:', response.status);
                console.error('Response data:', data);
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
    async function handleLogout() {
        try {
            // Call logout endpoint to clear HttpOnly cookies
            const response = await fetch(CONFIG.logoutUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CONFIG.csrfToken
                },
                credentials: 'include'  // Include cookies
            });
            
            // Clear client-side storage regardless of server response
            if (!CONFIG.useHttpOnlyCookie) {
                const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
                storage.removeItem('drf_auth_access_token');
                storage.removeItem('drf_auth_user_info');
            }
            
            updateAuthStatus(false);
            clearSwaggerAuthorization();
            showMessage(getMessage('logoutSuccess'), 'success');
            
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if server call fails
            updateAuthStatus(false);
            showMessage(getMessage('logoutSuccess'), 'success');
        }
    }

    // Handle token copy
    async function handleCopyToken() {
        if (CONFIG.useHttpOnlyCookie) {
            showMessage('Token copy not available with HttpOnly cookies for security', 'error');
            return;
        }
        
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

    // Set Swagger authorization with dynamic scheme detection
    function setSwaggerAuthorization(token) {
        const checkUI = () => {
            console.log('Checking UI');
            console.log('window.ui', window.ui);
            console.log('window.ui.preauthorizeApiKey', window.ui.preauthorizeApiKey);
            if (window.ui && window.ui.preauthorizeApiKey) {
                const schemeName = detectBearerScheme();
                if (schemeName) {
                    window.ui.preauthorizeApiKey(schemeName, token);
                    console.log(`Swagger authorization set successfully with scheme: ${schemeName}`);
                    updateAuthorizationModal(token);
                } else {
                    console.warn('No Bearer authentication scheme found in OpenAPI spec');
                }
            } else {
                setTimeout(checkUI, 500);
            }
        };
        checkUI();
    }

    // Detect Bearer authentication scheme from OpenAPI spec
    function detectBearerScheme() {
        try {
            // Method 1: Extract from Swagger UI spec
            const spec = window.ui?.specSelectors?.spec()?.toJS();
            if (spec?.components?.securitySchemes) {
                const schemes = spec.components.securitySchemes;
                
                // Find Bearer scheme
                const bearerScheme = Object.keys(schemes).find(name => {
                    const scheme = schemes[name];
                    return scheme?.type === 'http' && scheme?.scheme === 'bearer';
                });
                
                if (bearerScheme) {
                    console.log(`Auto-detected Bearer scheme: ${bearerScheme}`);
                    return bearerScheme;
                }
            }
            
            // Method 2: Try common names as fallback
            const commonNames = ['BearerAuth', 'Bearer', 'JWT', 'CognitoJWT', 'ApiKeyAuth', 'TokenAuth'];
            console.log('OpenAPI spec detection failed, trying common scheme names...');
            
            for (const name of commonNames) {
                try {
                    // Test if the scheme exists by attempting to set empty value
                    window.ui.preauthorizeApiKey(name, '');
                    console.log(`Found working scheme: ${name}`);
                    return name;
                } catch (e) {
                    // Scheme doesn't exist, continue
                }
            }
            
            console.warn('No Bearer authentication scheme could be detected');
            return null;
            
        } catch (error) {
            console.error('Error detecting Bearer scheme:', error);
            // Fallback to original behavior
            return 'BearerAuth';
        }
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
            const schemeName = detectBearerScheme();
            if (schemeName) {
                window.ui.preauthorizeApiKey(schemeName, '');
                console.log(`Swagger authorization cleared for scheme: ${schemeName}`);
            }
        }

        fillAuthorizationFields('');
        
        if (window.drfAuthObserver) {
            window.drfAuthObserver.disconnect();
            window.drfAuthObserver = null;
        }
    }

    // Check existing authentication
    function checkExistingAuth() {
        const token = getTokenFromStorage();
        const userInfo = getUserInfoFromStorage();
        
        if (token && userInfo) {
            try {
                updateAuthStatus(true, userInfo.email);
                // Set Swagger auth for storage-based tokens (not HttpOnly cookies)
                if (CONFIG.autoAuthorize && !CONFIG.useHttpOnlyCookie && token) {
                    setSwaggerAuthorization(token);
                }
            } catch (error) {
                console.error('Error checking existing auth:', error);
                // Clear invalid auth data
                if (!CONFIG.useHttpOnlyCookie) {
                    const storage = CONFIG.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
                    storage.removeItem('drf_auth_access_token');
                    storage.removeItem('drf_auth_user_info');
                }
            }
        } else if (CONFIG.useHttpOnlyCookie) {
            // For HttpOnly cookies, check user_email cookie to determine auth status
            const userEmail = getCookie('user_email');
            if (userEmail) {
                updateAuthStatus(true, userEmail);
                // Note: Cannot auto-authorize Swagger on page load with HttpOnly cookies
                // User needs to login to get the one-time swagger_token
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