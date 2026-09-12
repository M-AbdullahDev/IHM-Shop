
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
            const localSession = localStorage.getItem(this.sessionKey);
            const session = await window.SupabaseAuth.getSession();
            const role = localStorage.getItem('user_role') || 'admin';
            let activeShop = localStorage.getItem('active_shop') || 'All Shops';

            if (session || localSession === 'active') {
                if (!session) {
                    // Re-connect to Supabase in background
                    try {
                        await window.SupabaseAuth.signIn('ihm.irfan03@gmail.com', 'admin@irfan');
                    } catch (e) {
                        console.warn('Session background connect:', e);
                    }
                }
                const email = localStorage.getItem('zyro_admin_email') || (role === 'admin' ? 'Admin' : activeShop + ' Staff');
                const activeEmailInput = document.getElementById('settings-active-email');
                if (activeEmailInput) activeEmailInput.value = email;

                if (role === 'admin') {
                    sessionStorage.setItem('unlocked_with_admin_pin', 'true');
                } else {
                    sessionStorage.setItem('unlocked_with_admin_pin', 'false');
                }

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
        const roleSelection = document.getElementById('login-role-selection')?.value || 'admin';
        const shopSelect = document.getElementById('login-shop-select');

        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying session...';
        submitBtn.disabled = true;

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        const adminPin = localStorage.getItem('zyro_admin_pin') || 'admin2468';
        const shopPin = localStorage.getItem('zyro_shop_pin') || 'shop1234';

        try {
            if (roleSelection === 'shopkeeper') {
                const chosenShop = shopSelect ? shopSelect.value : 'Wholesale Shop';
                
                // Allow login if entered password/PIN matches shop PIN, admin PIN, or standard staff passwords
                const isValidShopPin = (
                    password === shopPin ||
                    password === 'shop1234' ||
                    password === 'Wholesale@' ||
                    password === 'shop2@' ||
                    password === 'shop3@' ||
                    password === 'admin' ||
                    password === adminPin ||
                    password === 'admin@irfan'
                );

                if (!isValidShopPin) {
                    throw new Error('Incorrect Shop PIN. Use ' + shopPin);
                }

                // Ensure Supabase session is established so all reads/writes save directly to Supabase
                try {
                    await window.SupabaseAuth.signIn('ihm.irfan03@gmail.com', 'admin@irfan');
                } catch(err) {
                    console.warn("Background Supabase auth:", err);
                }

                localStorage.setItem('zyro_admin_email', chosenShop + ' Staff');
                localStorage.setItem(this.sessionKey, 'active');
                localStorage.setItem('user_role', 'shopkeeper');
                localStorage.setItem('active_shop', chosenShop);
                sessionStorage.setItem('unlocked_with_admin_pin', 'false');

                const activeEmailInput = document.getElementById('settings-active-email');
                if (activeEmailInput) activeEmailInput.value = chosenShop + ' Staff';

                this.hideLogin();
                this.applyRoleUI('shopkeeper', chosenShop);

                await Store.init();
                window.dispatchEvent(new CustomEvent('inventoryUpdate'));

                passwordInput.value = '';
                errorMsg.style.display = 'none';

            } else {
                // Admin login
                const isValidAdminPin = (password === adminPin || password === 'admin' || password === 'admin@irfan');
                const loginEmail = (email && email.includes('@')) ? email : 'ihm.irfan03@gmail.com';
                const loginPassword = (password === adminPin || password === 'admin') ? 'admin@irfan' : password;

                try {
                    await window.SupabaseAuth.signIn(loginEmail, loginPassword);
                } catch (err) {
                    if (!isValidAdminPin) {
                        throw new Error('Incorrect credentials. Use Admin PIN ' + adminPin + ' or your password.');
                    }
                    try {
                        await window.SupabaseAuth.signIn('ihm.irfan03@gmail.com', 'admin@irfan');
                    } catch(e) {}
                }

                const activeShop = localStorage.getItem('active_shop') || 'All Shops';
                localStorage.setItem('zyro_admin_email', email || 'Admin');
                localStorage.setItem(this.sessionKey, 'active');
                localStorage.setItem('user_role', 'admin');
                localStorage.setItem('active_shop', activeShop);
                sessionStorage.setItem('unlocked_with_admin_pin', 'true');

                const activeEmailInput = document.getElementById('settings-active-email');
                if (activeEmailInput) activeEmailInput.value = email || 'Admin';

                this.hideLogin();
                this.applyRoleUI('admin', activeShop);

                await Store.init();
                window.dispatchEvent(new CustomEvent('inventoryUpdate'));

                passwordInput.value = '';
                errorMsg.style.display = 'none';
            }
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
        const navDashboard = document.getElementById('nav-dashboard');
        const navPos = document.getElementById('nav-pos');
        const navReceipts = document.getElementById('nav-receipts');
        const navAttention = document.getElementById('nav-attention');
        const navLedger = document.getElementById('nav-ledger');

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
            // Admin does NOT see Checkout or Receipts
            if (navPos) navPos.style.display = 'none';
            if (navReceipts) navReceipts.style.display = 'none';
            if (navAttention) navAttention.style.display = 'flex';
            if (navDashboard) navDashboard.style.display = 'flex';
            if (navLedger) navLedger.style.display = 'flex';
        } else {
            // Shopkeeper: hide shop switcher, lock to their shop
            if (shopSelector) {
                shopSelector.style.display = 'none';
            }
            if (roleBadge) {
                roleBadge.innerHTML = '<i class="fas fa-store"></i> ' + activeShop + ' Staff';
                roleBadge.style.color = 'var(--accent-success)';
            }
            // Shopkeeper DOES see Checkout and Receipts, but not Dashboard/Attention
            if (navPos) navPos.style.display = 'flex';
            if (navReceipts) navReceipts.style.display = 'flex';
            if (navAttention) navAttention.style.display = 'none';
            if (navDashboard) navDashboard.style.display = 'none';
            if (navLedger) navLedger.style.display = 'none';
        }

        const navUdhaar = document.getElementById('nav-udhaar');
        if (navUdhaar) {
            navUdhaar.style.display = 'flex';
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
    Attention.init();

    // Show Default Page
    const initRole = localStorage.getItem('user_role') || 'admin';
    if (initRole === 'admin') {
        UI.showPage('dashboard');
    } else {
        UI.showPage('inventory');
    }
    
    console.log('IHM Shop System Initialized');
});

window.Auth = Auth;

window.switchShop = function(shopName) {
    localStorage.setItem('active_shop', shopName);
    // Reload the page to ensure all state and UI is cleanly re-initialized with the new shop
    window.location.reload();
};
