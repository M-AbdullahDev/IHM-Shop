const fs = require('fs');

function replaceWords(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // index.html changes
    content = content.replace(/Clothing Inventory/g, 'Mobile Inventory');
    content = content.replace(/label="Clothing"/g, 'label="Mobiles"');
    content = content.replace(/Article Type/g, 'Category/Type');
    content = content.replace(/Article Code/g, 'Model/Code');
    content = content.replace(/edit-article-type/g, 'edit-category-type');
    content = content.replace(/add-article-type/g, 'add-category-type');
    content = content.replace(/Dress Shirt/g, 'iPhone');
    content = content.replace(/Jeans/g, 'Android');
    content = content.replace(/T-Shirt/g, 'Accessories');
    content = content.replace(/articleType/g, 'categoryType');
    
    fs.writeFileSync(filePath, content);
}

replaceWords('index.html');
console.log('Done updating index.html');
