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

    content = content.replace(/localStorage\.getItem\(['"]agra_hr_session['"]\)/g, 'sessionStorage.getItem("agra_hr_session")');
    content = content.replace(/localStorage\.setItem\(['"]agra_hr_session['"]/g, 'sessionStorage.setItem("agra_hr_session"');
    content = content.replace(/localStorage\.removeItem\(['"]agra_hr_session['"]\)/g, 'sessionStorage.removeItem("agra_hr_session")');

    if (content !== original) {
        fs.writeFileSync(file, content);
        count++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${count} files.`);
