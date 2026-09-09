const fs = require('fs');

// Update pos.js
let posContent = fs.readFileSync('js/pos.js', 'utf8');
posContent = posContent.replace(
    '<h1 style="font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #000; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0;">IHM Shop</h1>',
    '<img src="../assets/ihm_logo.jpg" style="max-height: 60px; margin-bottom: 5px; filter: grayscale(100%);"><br>\n                            <h1 style="font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #000; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0;">IHM Shop</h1>'
);
fs.writeFileSync('js/pos.js', posContent);

// Update receipts.js
let receiptsContent = fs.readFileSync('js/receipts.js', 'utf8');
receiptsContent = receiptsContent.replace(
    '<div style="font-size: 1.4rem; font-weight: 800; letter-spacing: 4px; margin-bottom: 0.25rem; color: var(--text-main);">IHM SHOP</div>',
    '<img src="assets/ihm_logo.jpg" style="max-height: 60px; margin-bottom: 10px; border-radius: 8px;"><br>\n                    <div style="font-size: 1.4rem; font-weight: 800; letter-spacing: 4px; margin-bottom: 0.25rem; color: var(--text-main);">IHM SHOP</div>'
);
fs.writeFileSync('js/receipts.js', receiptsContent);

console.log('Updated logos in receipts.');
