const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(/v=7/g, 'v=8');

fs.writeFileSync('index.html', content);

console.log('Bumped cache version.');
