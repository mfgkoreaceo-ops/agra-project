const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src/app');

let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace hr_user localStorage with sessionStorage
    content = content.replace(/localStorage\.getItem\(['"]hr_user['"]\)/g, 'sessionStorage.getItem("hr_user")');
    content = content.replace(/localStorage\.setItem\(['"]hr_user['"]/g, 'sessionStorage.setItem("hr_user"');
    content = content.replace(/localStorage\.removeItem\(['"]hr_user['"]\)/g, 'sessionStorage.removeItem("hr_user")');

    // Also replace isAdmin
    content = content.replace(/localStorage\.getItem\(['"]isAdmin['"]\)/g, 'sessionStorage.getItem("isAdmin")');
    content = content.replace(/localStorage\.setItem\(['"]isAdmin['"]/g, 'sessionStorage.setItem("isAdmin"');
    content = content.replace(/localStorage\.removeItem\(['"]isAdmin['"]\)/g, 'sessionStorage.removeItem("isAdmin")');

    if (content !== original) {
        fs.writeFileSync(file, content);
        count++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${count} files.`);
