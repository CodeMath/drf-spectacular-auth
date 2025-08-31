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

        // Only enable Copy Token button in non-HttpOnly cookie mode
        if (copyTokenBtn && CONFIG.showCopyButton && !CONFIG.useHttpOnlyCookie) {
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
                    
                    // Use swagger_token if available (v1.3.1+), fallback to access_token
                    // This allows both server implementations to work
                    const tokenForSwagger = CONFIG.useHttpOnlyCookie ? 
                        (data.swagger_token || data.access_token) : data.access_token;
                    
                    console.log('Token for Swagger:', tokenForSwagger ? 'EXISTS' : 'MISSING');
                    console.log('Available fields:', Object.keys(data));
                    console.log('Using token from:', data.swagger_token ? 'swagger_token' : 'access_token');
                    
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
                        console.error('Note: Both swagger_token and access_token are missing');
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
            // Only show Copy Token button in non-HttpOnly cookie mode
            if (copyTokenBtn && CONFIG.showCopyButton && !CONFIG.useHttpOnlyCookie) {
                copyTokenBtn.style.display = 'inline-block';
            } else if (copyTokenBtn) {
                copyTokenBtn.style.display = 'none';
            }
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
        let retryCount = 0;
        const maxRetries = 30; // 15 seconds total (500ms * 30)
        
        const checkUI = () => {
            console.log('🔍 Checking UI (attempt', retryCount + 1, '/' + maxRetries + ')');
            
            try {
                // Enhanced UI detection - check multiple possible UI objects
                console.log('🔎 Scanning for Swagger UI objects...');
                console.log('window.ui:', typeof window.ui);
                console.log('window.swaggerUi:', typeof window.swaggerUi);
                console.log('window.SwaggerUIBundle:', typeof window.SwaggerUIBundle);
                
                // Check for any script tags or DOM elements that might indicate Swagger UI
                const swaggerScripts = document.querySelectorAll('script[src*="swagger"]');
                const swaggerElements = document.querySelectorAll('[id*="swagger"], [class*="swagger"]');
                console.log('📄 Swagger scripts found:', swaggerScripts.length);
                console.log('🎨 Swagger DOM elements found:', swaggerElements.length);
                
                // Try different UI object patterns
                let uiObject = null;
                let methodName = 'preauthorizeApiKey';
                
                if (window.ui && typeof window.ui.preauthorizeApiKey === 'function') {
                    uiObject = window.ui;
                    console.log('✅ Found window.ui with preauthorizeApiKey');
                } else if (window.swaggerUi && typeof window.swaggerUi.preauthorizeApiKey === 'function') {
                    uiObject = window.swaggerUi;
                    console.log('✅ Found window.swaggerUi with preauthorizeApiKey');
                } else if (window.SwaggerUIBundle) {
                    console.log('⚠️ Found SwaggerUIBundle but no direct preauthorizeApiKey access');
                    
                    // Method 1: Try to find existing UI instance in DOM
                    const swaggerContainer = document.querySelector('#swagger-ui, .swagger-ui, [class*="swagger"]');
                    if (swaggerContainer && swaggerContainer.swaggerUIInstance) {
                        console.log('✅ Found SwaggerUI instance in DOM container');
                        uiObject = swaggerContainer.swaggerUIInstance;
                    } else {
                        // Method 2: Try to access global UI instance that might be stored elsewhere
                        const possibleUIs = Object.keys(window).filter(key => 
                            key.toLowerCase().includes('swagger') || 
                            key.toLowerCase().includes('ui')
                        );
                        console.log('🔍 Possible UI objects:', possibleUIs);
                        
                        for (const key of possibleUIs) {
                            if (window[key] && typeof window[key].preauthorizeApiKey === 'function') {
                                uiObject = window[key];
                                console.log(`✅ Found ${key} with preauthorizeApiKey`);
                                break;
                            }
                        }
                        
                        // Method 3: Try to create or access UI through SwaggerUIBundle
                        if (!uiObject && typeof window.SwaggerUIBundle === 'function') {
                            console.log('🔧 Attempting to access UI through SwaggerUIBundle...');
                            
                            // Look for existing swagger instances in common patterns
                            const commonSelectors = [
                                '#swagger-ui',
                                '.swagger-ui', 
                                '[id*="swagger"]',
                                '.swagger-wrapper'
                            ];
                            
                            for (const selector of commonSelectors) {
                                const element = document.querySelector(selector);
                                if (element) {
                                    console.log(`📍 Found swagger element: ${selector}`);
                                    // Try to access the UI instance that might be attached to the element
                                    if (element._swaggerUIInstance || element.ui) {
                                        uiObject = element._swaggerUIInstance || element.ui;
                                        console.log('✅ Found UI instance attached to DOM element');
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (uiObject) {
                    console.log('🎯 Swagger UI object found, attempting authorization...');
                    const schemeName = detectBearerScheme(uiObject);
                    if (schemeName) {
                        uiObject.preauthorizeApiKey(schemeName, token);
                        console.log(`✅ Swagger authorization set successfully with scheme: ${schemeName}`);
                        updateAuthorizationModal(token);
                    } else {
                        console.warn('⚠️ No Bearer authentication scheme found in OpenAPI spec');
                        // Try common scheme names as fallback
                        const commonSchemes = ['BearerAuth', 'Bearer', 'JWT', 'CognitoJWT'];
                        for (const scheme of commonSchemes) {
                            try {
                                uiObject.preauthorizeApiKey(scheme, token);
                                console.log(`✅ Authorization set with fallback scheme: ${scheme}`);
                                updateAuthorizationModal(token);
                                break;
                            } catch (e) {
                                console.log(`❌ Failed with scheme ${scheme}:`, e.message);
                            }
                        }
                    }
                    return; // Success, exit retry loop
                }
                
                // Last resort: try to manually set authorization header in the DOM
                console.log('❌ No suitable Swagger UI object found, trying DOM manipulation...');
                
                // Method 1: Try to find and fill authorization input fields
                const authInputSelectors = [
                    'input[placeholder*="Bearer"]',
                    'input[placeholder*="bearer"]', 
                    'input[name*="Authorization"]',
                    'input[name*="authorization"]',
                    'input[id*="auth"]',
                    'input[class*="auth"]',
                    'input[type="text"]', // Fallback to any text input in auth context
                    'textarea[placeholder*="Bearer"]'
                ];
                
                for (const selector of authInputSelectors) {
                    const authInput = document.querySelector(selector);
                    if (authInput) {
                        console.log(`🎯 Found auth input with selector: ${selector}`);
                        authInput.value = `Bearer ${token}`;
                        authInput.dispatchEvent(new Event('input', { bubbles: true }));
                        authInput.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log('✅ Token set via DOM input field');
                        
                        // Auto-click the authorize button in the modal
                        setTimeout(() => {
                            const authorizeBtn = document.querySelector('.btn.modal-btn.auth.authorize, button[aria-label="Apply credentials"], .auth-btn-wrapper button[type="submit"]');
                            if (authorizeBtn) {
                                console.log('🔘 Auto-clicking Authorize button in modal');
                                authorizeBtn.click();
                                console.log('✅ Authorize button clicked - authentication should be applied');
                            } else {
                                console.log('⚠️ Authorize button not found in modal');
                            }
                        }, 200);
                        
                        updateAuthorizationModal(token);
                        return;
                    }
                }
                
                // Method 2: Try to use DRF Spectacular specific approach
                console.log('🔧 Trying DRF Spectacular specific authorization...');
                
                // Wait a bit more and try to trigger authorization through different methods
                setTimeout(() => {
                    // Look for authorization modal or popup
                    const authModal = document.querySelector('.auth-wrapper, .authorization__wrapper, [class*="auth-container"]');
                    if (authModal) {
                        console.log('📱 Found authorization modal');
                        const modalInput = authModal.querySelector('input[type="text"], input[type="password"], textarea');
                        if (modalInput) {
                            modalInput.value = `Bearer ${token}`;
                            modalInput.dispatchEvent(new Event('input', { bubbles: true }));
                            modalInput.dispatchEvent(new Event('change', { bubbles: true }));
                            console.log('✅ Token set in authorization modal');
                            
                            // Try to find and click authorize/login button in modal
                            setTimeout(() => {
                                const modalBtn = authModal.querySelector('button[class*="authorize"], button[class*="auth"], .btn-auth, .btn.modal-btn.auth.authorize');
                                if (modalBtn) {
                                    console.log('🔘 Auto-clicking authorization button in modal');
                                    modalBtn.click();
                                    console.log('✅ Authorization button clicked in modal');
                                } else {
                                    console.log('⚠️ Authorization button not found in modal');
                                }
                            }, 200);
                            return;
                        }
                    }
                    
                    // Try global document approach
                    const allInputs = document.querySelectorAll('input[type="text"], textarea');
                    console.log(`🔍 Found ${allInputs.length} text inputs, searching for auth-related ones...`);
                    
                    for (const input of allInputs) {
                        const placeholder = input.placeholder?.toLowerCase() || '';
                        const name = input.name?.toLowerCase() || '';
                        const id = input.id?.toLowerCase() || '';
                        const className = input.className?.toLowerCase() || '';
                        
                        if (placeholder.includes('token') || placeholder.includes('bearer') || placeholder.includes('auth') ||
                            name.includes('token') || name.includes('bearer') || name.includes('auth') ||
                            id.includes('token') || id.includes('bearer') || id.includes('auth') ||
                            className.includes('token') || className.includes('bearer') || className.includes('auth')) {
                            
                            console.log('🎯 Found potential auth input:', {
                                placeholder: input.placeholder,
                                name: input.name,
                                id: input.id,
                                className: input.className
                            });
                            
                            input.value = `Bearer ${token}`;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            console.log('✅ Token set via pattern matching');
                            
                            // Try to find and click nearby authorize button
                            setTimeout(() => {
                                const nearbyBtn = input.closest('form, .auth-container, .modal-ux-content')?.querySelector('.btn.modal-btn.auth.authorize, button[type="submit"]');
                                if (nearbyBtn) {
                                    console.log('🔘 Auto-clicking nearby authorize button');
                                    nearbyBtn.click();
                                    console.log('✅ Nearby authorize button clicked');
                                }
                            }, 200);
                            return;
                        }
                    }
                }, 1000);
                
                // Try to find authorize button and show helpful info
                const authorizeBtn = document.querySelector('button[class*="authorize"], button[id*="authorize"], .btn-authorize, button[class*="auth"]');
                if (authorizeBtn) {
                    console.log('🔘 Found authorize button, manual authorization may be needed');
                    console.log('💡 Token available for manual entry:', token.substring(0, 20) + '...');
                    
                    // Try to click the authorize button to open the modal
                    try {
                        authorizeBtn.click();
                        console.log('🔘 Clicked authorize button to open modal');
                        
                        // Wait and try to fill the opened modal
                        setTimeout(() => {
                            const modalInputs = document.querySelectorAll('input[type="text"]:not([style*="display: none"]), textarea:not([style*="display: none"])');
                            if (modalInputs.length > 0) {
                                console.log(`📝 Found ${modalInputs.length} visible inputs after clicking authorize`);
                                modalInputs[0].value = `Bearer ${token}`;
                                modalInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                                modalInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
                                console.log('✅ Token set in opened authorization modal');
                                
                                // Auto-click the authorize button in the opened modal
                                setTimeout(() => {
                                    const modalAuthorizeBtn = document.querySelector('.btn.modal-btn.auth.authorize, button[aria-label="Apply credentials"]');
                                    if (modalAuthorizeBtn) {
                                        console.log('🔘 Auto-clicking Authorize button in opened modal');
                                        modalAuthorizeBtn.click();
                                        console.log('✅ Final authorization completed');
                                    }
                                }, 300);
                            }
                        }, 500);
                    } catch (e) {
                        console.log('❌ Failed to click authorize button:', e.message);
                    }
                }
                
                console.log('❌ No suitable Swagger UI object found');
                
            } catch (error) {
                console.log('🔍 UI check error (will retry):', error.message);
            }
            
            // Retry logic
            retryCount++;
            if (retryCount < maxRetries) {
                console.log('⏳ Swagger UI not ready, retrying in 500ms... (' + retryCount + '/' + maxRetries + ')');
                setTimeout(checkUI, 500);
            } else {
                console.error('❌ Failed to access Swagger UI after', maxRetries, 'attempts (15 seconds)');
                console.error('💡 Possible causes:');
                console.error('   - Swagger UI not fully loaded');
                console.error('   - Different Swagger UI version or configuration');
                console.error('   - Custom Swagger UI implementation');
                console.error('📊 Environment info:');
                console.error('   - User Agent:', navigator.userAgent);
                console.error('   - Page URL:', window.location.href);
                console.error('   - Available window objects:', Object.keys(window).filter(k => k.toLowerCase().includes('swagger') || k.toLowerCase().includes('ui')));
            }
        };
        
        checkUI();
    }

    // Detect Bearer authentication scheme from OpenAPI spec
    function detectBearerScheme(uiObject) {
        try {
            // Method 1: Extract from Swagger UI spec
            const spec = uiObject?.specSelectors?.spec()?.toJS();
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
            const schemeName = detectBearerScheme(window.ui);
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