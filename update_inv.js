const fs = require('fs');

function replaceWords(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/Article Type/g, 'Category/Type');
    
    fs.writeFileSync(filePath, content);
}

replaceWords('js/inventory.js');
console.log('Done updating inventory.js');
