
const Auth = {
    sessionKey: 'zyro_admin_session',
    passwordKey: 'zyro_admin_password',
    defaultPassword: 'admin',

    init() {
        // Set default password if none exists
        if (!localStorage.getItem(this.passwordKey)) {
            localStorage.setItem(this.passwordKey, this.defaultPassword);
        }
        this.setupListeners();
        this.checkSession();
    },

    setupListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        const changePwdForm = document.getElementById('change-password-form');
        if (changePwdForm) {
            changePwdForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentPwd = document.getElementById('current-password').value;
                const newPwd = document.getElementById('new-password').value;
                const submitBtn = changePwdForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                const storedPassword = localStorage.getItem(this.passwordKey);
                if (currentPwd !== storedPassword) {
                    alert('Authentication failed: Current password incorrect.');
                    return;
                }

                if (!newPwd || newPwd.length < 3) {
                    alert('New password must be at least 3 characters long.');
                    return;
                }

                localStorage.setItem(this.passwordKey, newPwd);
                alert('Success: Password updated locally!');
                changePwdForm.reset();
            });
        }

        const clearSalesBtn = document.getElementById('clear-sales-analytics-btn');
        if (clearSalesBtn) {
            clearSalesBtn.addEventListener('click', async () => {
                if (confirm('⚠️ DANGER: Are you sure you want to permanently clear all sales history and reset analytics? This action cannot be undone.')) {
                    if (confirm('Please confirm one more time: Do you really want to delete all transaction records?')) {
                        Store.clearSales();
                        alert('Sales history and analytics successfully cleared!');
                        window.dispatchEvent(new CustomEvent('inventoryUpdate'));
                    }
                }
            });
        }

        const forgotPwdBtn = document.getElementById('forgot-pwd-btn');
        if (forgotPwdBtn) {
            forgotPwdBtn.addEventListener('click', () => this.handleForgotPassword());
        }

        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRecovery();
            });
        }
    },

    checkSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session === 'active') {
            const email = localStorage.getItem('zyro_admin_email') || 'Admin';
            const activeEmailInput = document.getElementById('settings-active-email');
            if (activeEmailInput) activeEmailInput.value = email;
            this.hideLogin();
        } else {
            this.showLogin();
        }
    },

    handleForgotPassword() {
        // Reset password to default
        if (confirm('Reset password to default ("admin")? You can change it later from Settings.')) {
            localStorage.setItem(this.passwordKey, this.defaultPassword);
            alert('Password has been reset to "admin". Please login and change it from Settings.');
        }
    },

    handleRecovery() {
        // Legacy — handled by handleForgotPassword now
    },

    handleLogin() {
        const emailInput = document.getElementById('admin-login-email');
        const passwordInput = document.getElementById('admin-password');
        const errorMsg = document.getElementById('login-error');
        const submitBtn = document.querySelector('#login-form button[type="submit"]');

        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;

        const password = passwordInput.value;
        const storedPassword = localStorage.getItem(this.passwordKey);

        if (password === storedPassword) {
            // Save email as display name
            if (emailInput && emailInput.value.trim()) {
                localStorage.setItem('zyro_admin_email', emailInput.value.trim());
            }
            localStorage.setItem(this.sessionKey, 'active');

            const activeEmailInput = document.getElementById('settings-active-email');
            if (activeEmailInput) activeEmailInput.value = emailInput ? emailInput.value.trim() : 'Admin';

            this.hideLogin();
            passwordInput.value = '';
            errorMsg.style.display = 'none';
        } else {
            errorMsg.textContent = 'Verification failed: Incorrect password.';
            errorMsg.style.display = 'block';
            passwordInput.value = '';
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    },

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(this.sessionKey);
            localStorage.removeItem('zyro_admin_email');
            const activeEmailInput = document.getElementById('settings-active-email');
            if (activeEmailInput) activeEmailInput.value = 'Loading...';
            this.showLogin();
        }
    },

    showLogin() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'flex';
    },

    hideLogin() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Auth first
    Auth.init();

    // Initialize Data
    Store.init();

    // Initialize UI and Navigation
    UI.init();

    // Initialize Modules
    Dashboard.init();
    Analytics.init();
    Ledger.init();
    Inventory.init();
    WinterCollection.init();
    Accessories.init();
    POS.init();
    Receipts.init();

    // Show Default Page
    UI.showPage('dashboard');
    
    console.log('Demo Shop System Initialized');
});

window.Auth = Auth;
