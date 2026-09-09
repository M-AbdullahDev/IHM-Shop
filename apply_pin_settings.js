const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = '<div style="border-top: 1px solid var(--glass-border); padding-top: 1.5rem;">';
const idx = html.indexOf(target);
if (idx === -1) {
    console.error('Target not found!');
    process.exit(1);
}

const endMarker = '<div class="glass-card">';
const endIdx = html.indexOf(endMarker, idx);
if (endIdx === -1) {
    console.error('End marker not found!');
    process.exit(1);
}

const replacement = `<div style="border-top: 1px solid var(--glass-border); padding-top: 1.5rem; margin-top: 1.5rem;">
                            <h4 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--text-main); font-family: 'Outfit';">
                                <i class="fas fa-shield-halved" style="color: var(--accent-primary); margin-right: 0.5rem;"></i>
                                Security PIN Configuration
                            </h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
                                <strong>Admin PIN:</strong> Grants full view of Cost Prices, Gross Profits & Margins.<br>
                                <strong>Shop PIN:</strong> Allows shopkeepers/staff to view stock and sales, while <em>completely hiding</em> Cost Prices and Profit Margins.
                            </p>
                            <form id="change-pins-form">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                                    <div class="form-group">
                                        <label style="font-size: 0.75rem; text-transform: uppercase;">Admin PIN (Full Cost Access)</label>
                                        <input type="text" id="setting-admin-pin" placeholder="admin2468" required style="font-weight: 700; letter-spacing: 0.1em; background: var(--bg-main);">
                                    </div>
                                    <div class="form-group">
                                        <label style="font-size: 0.75rem; text-transform: uppercase;">Shop PIN (Cost Hidden)</label>
                                        <input type="text" id="setting-shop-pin" placeholder="shop1234" required style="font-weight: 700; letter-spacing: 0.1em; background: var(--bg-main);">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" style="border-radius: 10px;">Save Security PINs</button>
                            </form>
                        </div>
                    </div>

                    `;

const newHtml = html.substring(0, idx) + replacement + html.substring(endIdx);
fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('Successfully updated index.html with PIN settings!');
