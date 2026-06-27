const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace css/style.css?v=3 with css/style.css?v=4
    content = content.replace(/href="css\/style\.css(\?v=\d+)?"/g, 'href="css/style.css?v=4"');
    
    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Cache busters incremented to v=4.');
