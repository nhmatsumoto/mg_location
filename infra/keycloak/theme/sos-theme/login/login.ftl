<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="${url.resourcesPath}/css/styles.css" rel="stylesheet" />
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="logo-circle">
                    <i data-lucide="shield-alert" class="logo-icon"></i>
                </div>
                <h1>SOS Location</h1>
                <p>Sign in to access the Tactical Terminal</p>
            </div>

            <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="alert alert-${message.type}">
                    <span class="alert-icon">
                        <#if message.type = 'success'><i data-lucide="check-circle"></i></#if>
                        <#if message.type = 'warning'><i data-lucide="alert-triangle"></i></#if>
                        <#if message.type = 'error'><i data-lucide="x-circle"></i></#if>
                        <#if message.type = 'info'><i data-lucide="info"></i></#if>
                    </span>
                    <span class="alert-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <form id="kc-form-login" class="login-form" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                
                <div class="form-group">
                    <label for="username" class="form-label">${msg("usernameOrEmail")}</label>
                    <div class="input-wrapper">
                        <i data-lucide="user" class="input-icon"></i>
                        <input tabindex="1" id="username" class="form-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username" placeholder="Enter your username or email" />
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">${msg("password")}</label>
                    <div class="input-wrapper">
                        <i data-lucide="lock" class="input-icon"></i>
                        <input tabindex="2" id="password" class="form-input" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" />
                        <button type="button" class="password-toggle" id="togglePasswordBtn" tabindex="-1">
                            <i data-lucide="eye" id="eyeIcon"></i>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <#if realm.rememberMe>
                        <div class="remember-me">
                            <label>
                                <#if login.rememberMe??>
                                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked>
                                <#else>
                                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox">
                                </#if>
                                <span class="checkbox-custom"></span>
                                <span>${msg("rememberMe")}</span>
                            </label>
                        </div>
                    </#if>
                    
                    <#if realm.resetPasswordAllowed>
                        <div class="forgot-password">
                            <a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                        </div>
                    </#if>
                </div>

                <div class="form-submit">
                    <button tabindex="4" class="btn-primary" name="login" id="kc-login" type="submit">
                        <span>${msg("doLogIn")}</span>
                        <i data-lucide="arrow-right"></i>
                    </button>
                </div>
            </form>

            <#if realm.password && social.providers??>
                <div class="social-providers">
                    <div class="divider">
                        <span>Or continue with</span>
                    </div>
                    <div class="provider-list">
                        <#list social.providers as p>
                            <a href="${p.loginUrl}" id="social-${p.alias}" class="brand-btn brand-${p.alias}">
                                <#if p.alias == "google">
                                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                                    <span>Google</span>
                                <#elseif p.alias == "facebook">
                                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <span>Facebook</span>
                                <#else>
                                    <span>${p.displayName!}</span>
                                </#if>
                            </a>
                        </#list>
                    </div>
                </div>
            </#if>

            <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                <div class="login-footer">
                    <span>${msg("noAccount")}</span>
                    <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a>
                </div>
            </#if>
        </div>
    </div>

    <script>
        lucide.createIcons();
        
        // Toggle password visibility
        const togglePasswordBtn = document.getElementById('togglePasswordBtn');
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');
        
        if (togglePasswordBtn && passwordInput && eyeIcon) {
            togglePasswordBtn.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                if (type === 'text') {
                    eyeIcon.setAttribute('data-lucide', 'eye-off');
                } else {
                    eyeIcon.setAttribute('data-lucide', 'eye');
                }
                lucide.createIcons();
            });
        }
    </script>
</body>
</html>
