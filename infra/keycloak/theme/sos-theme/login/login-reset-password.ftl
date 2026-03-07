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
                <div class="logo-circle" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <i data-lucide="key" class="logo-icon"></i>
                </div>
                <h1>${msg("emailForgotTitle")}</h1>
                <p>Enter your email to receive recovery instructions</p>
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

            <form id="kc-reset-password-form" class="login-form" action="${url.loginAction}" method="post">
                <div class="form-group">
                    <label for="username" class="form-label">${msg("emailInstruction")}</label>
                    <div class="input-wrapper">
                        <i data-lucide="mail" class="input-icon"></i>
                        <input tabindex="1" id="username" class="form-input" name="username" type="text" autofocus autocomplete="email" placeholder="Email address" />
                    </div>
                </div>

                <div class="form-submit" style="margin-top: 1.5rem">
                    <button tabindex="2" class="btn-primary" type="submit" style="background: var(--success);">
                        <span>${msg("doSubmit")}</span>
                    </button>
                </div>
                
                <div class="form-submit" style="margin-top: 1rem">
                    <a tabindex="3" href="${url.loginUrl}" class="btn-primary" style="background: var(--input-bg); border: 1px solid var(--border-color);">
                        <span>${msg("backToLogin")}</span>
                    </a>
                </div>
            </form>
        </div>
    </div>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
