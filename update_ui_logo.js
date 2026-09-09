const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Replace login screen logo-text
content = content.replace(
    '<div class="logo-text">IHM SHOP</div>',
    '<img src="assets/ihm_logo.jpg" style="height: 50px; margin-bottom: 0.5rem; border-radius: 8px;">\n                    <div class="logo-text">IHM SHOP</div>'
);

// Replace sidebar logo-text (the second one)
content = content.replace(
    '<div class="logo-text">IHM SHOP</div>',
    '<img src="assets/ihm_logo.jpg" style="height: 40px; margin-bottom: 0.25rem; border-radius: 6px;">\n                        <div class="logo-text">IHM SHOP</div>'
);

fs.writeFileSync('index.html', content);

console.log('Updated logos in index.html.');
