
window.isCostPriceAllowed = function() {
    // 1. Full admin logged in via Supabase
    if (localStorage.getItem('user_role') === 'admin') return true;
    // 2. Unlocked using Admin PIN (admin2468)
    if (sessionStorage.getItem('unlocked_with_admin_pin') === 'true') return true;
    // Otherwise cost prices and profits are hidden from shopkeeper/staff
    return false;
};

const Auth = {
    sessionKey: 'zyro_admin_session',
    passwordKey: 'zyro_admin_password',
    defaultPassword: 'admin',

    init() {
        // Set default password and PINs if none exist
        if (!localStorage.getItem(this.passwordKey)) {
            localStorage.setItem(this.passwordKey, this.defaultPassword);
        }
        if (!localStorage.getItem('zyro_admin_pin')) {
            localStorage.setItem('zyro_admin_pin', 'admin2468');
        }
        if (!localStorage.getItem('zyro_shop_pin')) {
            localStorage.setItem('zyro_shop_pin', 'shop1234');
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

        const changePinsForm = document.getElementById('change-pins-form');
        const adminPinInput = document.getElementById('setting-admin-pin');
        const shopPinInput = document.getElementById('setting-shop-pin');

        if (adminPinInput) adminPinInput.value = localStorage.getItem('zyro_admin_pin') || 'admin2468';
        if (shopPinInput) shopPinInput.value = localStorage.getItem('zyro_shop_pin') || 'shop1234';

        if (changePinsForm) {
            changePinsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newAdminPin = adminPinInput ? adminPinInput.value.trim() : '';
                const newShopPin = shopPinInput ? shopPinInput.value.trim() : '';

                if (!newAdminPin || newAdminPin.length < 3) {
                    alert('Admin PIN must be at least 3 characters long.');
                    return;
                }
                if (!newShopPin || newShopPin.length < 3) {
                    alert('Shop PIN must be at least 3 characters long.');
                    return;
                }

                localStorage.setItem('zyro_admin_pin', newAdminPin);
                localStorage.setItem('zyro_shop_pin', newShopPin);
                alert('Success: Security PINs updated successfully!\n\nAdmin PIN: ' + newAdminPin + '\nShop PIN: ' + newShopPin);
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

    async checkSession() {
        try {
            const session = await window.SupabaseAuth.getSession();
            if (session) {
                const email = session.user.email;
                const profile = await window.SupabaseAuth.getProfile(session.user.id);
                const role = profile.role || 'shopkeeper';
                
                let activeShop = 'All Shops';
                if (role === 'shopkeeper' && profile.shop_id) {
                    const { data: shop } = await window.supabaseClient.from('shops').select('name').eq('id', profile.shop_id).single();
                    activeShop = shop ? shop.name : 'Unknown Shop';
                } else if (role === 'admin') {
                    activeShop = localStorage.getItem('active_shop') || 'All Shops';
                }

                // Sync localstorage for instant UI lookups
                localStorage.setItem('zyro_admin_email', email);
                localStorage.setItem(this.sessionKey, 'active');
                localStorage.setItem('user_role', role);
                localStorage.setItem('active_shop', activeShop);

                const activeEmailInput = document.getElementById('settings-active-email');
                if (activeEmailInput) activeEmailInput.value = email;
                this.hideLogin();
                this.applyRoleUI(role, activeShop);
            } else {
                this.showLogin();
            }
        } catch (e) {
            console.error("Session check failed", e);
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

    async handleLogin() {
        const emailInput = document.getElementById('admin-login-email');
        const passwordInput = document.getElementById('admin-password');
        const errorMsg = document.getElementById('login-error');
        const submitBtn = document.querySelector('#login-form button[type="submit"]');

        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying with Supabase...';
        submitBtn.disabled = true;

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput.value;

        try {
            // 1. Sign in with Supabase Auth
            const authData = await window.SupabaseAuth.signIn(email, password);
            const user = authData.user;

            // 2. Fetch user profile for role and shop
            const profile = await window.SupabaseAuth.getProfile(user.id);
            
            // 3. Set role and shop
            const role = profile.role || 'shopkeeper';
            let activeShop = 'All Shops';
            
            if (role === 'shopkeeper' && profile.shop_id) {
                // Fetch shop name if needed, but for now we can just use the ID or a placeholder.
                // In a full implementation we'd join the shop table, but let's assume Store has it.
                const { data: shop } = await window.supabaseClient.from('shops').select('name').eq('id', profile.shop_id).single();
                activeShop = shop ? shop.name : 'Unknown Shop';
            }

            // Save basic session metadata locally for quick UI checks
            localStorage.setItem('zyro_admin_email', email);
            localStorage.setItem(this.sessionKey, 'active');
            localStorage.setItem('user_role', role);
            localStorage.setItem('active_shop', activeShop);

            const activeEmailInput = document.getElementById('settings-active-email');
            if (activeEmailInput) activeEmailInput.value = email;

            this.hideLogin();
            this.applyRoleUI(role, activeShop);
            
            // Trigger a data reload now that we are authenticated
            await Store.init();
            window.dispatchEvent(new CustomEvent('inventoryUpdate'));

            passwordInput.value = '';
            errorMsg.style.display = 'none';

        } catch (error) {
            console.error('Login error:', error);
            errorMsg.textContent = 'Verification failed: ' + (error.message || 'Incorrect credentials.');
            errorMsg.style.display = 'block';
            passwordInput.value = '';
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    applyRoleUI(role, activeShop) {
        const shopSelector = document.getElementById('global-shop-selector');
        const roleBadge = document.getElementById('sidebar-role-badge');

        if (role === 'admin') {
            // Admin: show shop switcher with "All Shops" option
            if (shopSelector) {
                shopSelector.style.display = 'block';
                shopSelector.value = activeShop;
            }
            if (roleBadge) {
                roleBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Admin — ' + activeShop;
                roleBadge.style.color = 'var(--accent-primary)';
            }
        } else {
            // Employee: hide shop switcher, lock to their shop
            if (shopSelector) {
                shopSelector.style.display = 'none';
            }
            if (roleBadge) {
                roleBadge.innerHTML = '<i class="fas fa-store"></i> ' + activeShop + ' Staff';
                roleBadge.style.color = 'var(--accent-success)';
            }
        }

        const navUdhaar = document.getElementById('nav-udhaar');
        if (navUdhaar) {
            if (role === 'admin' || activeShop === 'Wholesale Shop') {
                navUdhaar.style.display = 'flex';
            } else {
                navUdhaar.style.display = 'none';
            }
        }
    },

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await window.SupabaseAuth.signOut();
            } catch (e) {
                console.error("Logout error", e);
            }
            localStorage.removeItem(this.sessionKey);
            localStorage.removeItem('zyro_admin_email');
            localStorage.removeItem('user_role');
            localStorage.removeItem('active_shop');
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
    Udhaar.init();
    Receipts.init();

    // Show Default Page
    UI.showPage('dashboard');
    
    console.log('IHM Shop System Initialized');
});

window.Auth = Auth;

window.switchShop = function(shopName) {
    localStorage.setItem('active_shop', shopName);
    // Reload the page to ensure all state and UI is cleanly re-initialized with the new shop
    window.location.reload();
};
