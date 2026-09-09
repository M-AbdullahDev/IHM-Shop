const fs = require('fs');

const missingContent = `
<body>

    <div id="app">
        <!-- Sidebar Navigation -->
        <aside>
            <div class="logo" style="justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="assets/ihm_logo.jpg" style="height: 40px; border-radius: 6px;">
                    <div class="logo-text">IHM SHOP</div>
                </div>
                <button id="theme-toggle" class="btn-icon sidebar-text" title="Toggle Theme"
                    style="background: transparent; border: 1px solid var(--glass-border); color: var(--text-main); width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition);">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
            
                  <div style="margin-bottom: 1rem;">
                <select id="global-shop-selector" style="width: 100%; padding: 0.5rem; border-radius: 8px; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--glass-border); font-size: 0.85rem; cursor: pointer; font-weight: 600;" onchange="window.switchShop(this.value)">
                    <option value="All Shops">🏢 All Shops</option>
                    <option value="Wholesale Shop">🏪 Wholesale Shop</option>
                    <option value="Shop 2">🏪 Shop 2</option>
                    <option value="Shop 3">🏪 Shop 3</option>
                </select>
                <div id="sidebar-role-badge" style="margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700; text-align: center; padding: 0.3rem 0; color: var(--accent-primary);"></div>
            </div>

            <nav>
                <div class="nav-item active" data-page="dashboard">
                    <i class="fas fa-th-large"></i>
                    <span>Dashboard</span>
                </div>
                <div class="nav-item" data-page="inventory">
                    <i class="fas fa-boxes-stacked"></i>
                    <span>Product List</span>
                </div>
                <div class="nav-item" data-page="wintercollection">
                    <i class="fas fa-snowflake"></i>
                    <span>Winter Collection</span>
                </div>
                <div class="nav-item" data-page="accessories">
                    <i class="fas fa-gem"></i>
                    <span>Accessories</span>
                </div>
                <div class="nav-item" data-page="analytics">
                    <i class="fas fa-chart-line"></i>
                    <span>Sales Analytics</span>
                </div>
                <div class="nav-item" data-page="ledger">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span>Admin Ledger</span>
                </div>
                <div class="nav-item" data-page="udhaar" id="nav-udhaar">
                    <i class="fas fa-book"></i>
                    <span>Udhaar Ledger</span>
                </div>
                <div class="nav-item" data-page="pos">
                    <i class="fas fa-cash-register"></i>
                    <span>Checkout</span>
                </div>
                <div class="nav-item" data-page="receipts">
                    <i class="fas fa-receipt"></i>
                    <span>Receipts Vault</span>
                </div>
                <div class="nav-item" data-page="settings">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </div>
            </nav>

            <div style="margin-top: auto; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 1rem; cursor: pointer;" id="logout-btn">
                    <div
                        style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card-hover); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-sign-out-alt" style="color: var(--accent-danger);"></i>
                    </div>
                    <div class="sidebar-text">
                        <div style="font-weight: 600; font-size: 0.9rem;">Logout</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Admin Session</div>
                    </div>
                </div>

                <div id="sync-indicator"
                    style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); margin-left: 16px;">
                    <i class="fas fa-circle" style="font-size: 0.5rem; color: var(--accent-danger); flex-shrink: 0;"></i>
                    <span class="sidebar-text">Offline</span>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.7rem; color: var(--text-muted); margin-left: 16px; font-weight: bold; opacity: 0.5;">
                    v3.2.1 | <span id="diag-prod-count">0</span> products, <span id="diag-acc-count">0</span> accessories
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->

        <main>

            <!-- Login Overlay -->
            <div id="login-overlay"
                style="position: fixed; inset: 0; background: var(--bg-main); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div class="glass-card"
                    style="width: 100%; max-width: 440px; padding: 4rem 3rem; text-align: center; position: relative; z-index: 2; border: 1px solid var(--glass-border); animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;">
                    <div class="logo" style="justify-content: center; margin-bottom: 2.5rem; flex-direction: column; align-items: center;">
                        <img src="assets/ihm_logo.jpg" style="height: 60px; margin-bottom: 0.5rem; border-radius: 8px;">
                        <div class="logo-text">IHM SHOP</div>
                    </div>
                    <h2 style="margin-bottom: 0.5rem; font-family: 'Outfit'; font-weight: 800; font-size: 2rem;">Secure Login</h2>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Select your role to continue</p>

                    <div style="display: flex; background: var(--bg-main); border-radius: 12px; padding: 0.4rem; margin-bottom: 2rem; border: 1px solid var(--glass-border);">
                        <button type="button" id="login-tab-admin" class="btn btn-ghost" style="flex: 1; justify-content: center; background: var(--bg-card); color: var(--text-main); border-radius: 8px;" onclick="window.setLoginRole('admin')">Admin</button>
`;

let content = fs.readFileSync('index.html', 'utf8');

// The file was truncated after </head> and then immediately has the button for shopkeeper
const target = '</head>\n                        <button type="button" id="login-tab-shopkeeper"';
const target2 = '</head>\r\n                        <button type="button" id="login-tab-shopkeeper"';

if (content.includes('</head>\n                        <button type="button"')) {
    content = content.replace('</head>\n                        <button type="button"', '</head>\n' + missingContent + '                        <button type="button"');
} else if (content.includes('</head>\r\n                        <button type="button"')) {
    content = content.replace('</head>\r\n                        <button type="button"', '</head>\r\n' + missingContent + '                        <button type="button"');
}

fs.writeFileSync('index.html', content);

console.log('Restored deleted content in index.html');
