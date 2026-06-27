const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Tutor<span>in</span> with Tutorin
    content = content.replace(/Tutor<span>in<\/span>/g, 'Tutorin');
    
    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Logo text fixed in all HTML files.');
