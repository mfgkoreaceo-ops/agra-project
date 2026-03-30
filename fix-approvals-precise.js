const fs = require('fs');
const path = require('path');

const targetDirs = [
    'leave-self', 'leave', 
    'certificates-self', 'certificates', 
    'resignation-self', 'resignations', 
    'incident-self', 'incidents'
];

targetDirs.forEach(dir => {
    const file = path.join(__dirname, 'src', 'app', 'hr-portal-admin', dir, 'page.tsx');
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // 1. Remove <th>인사부문</th>
        content = content.replace(/<th style=\{\{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" \}\}>인사부문<\/th>/g, '');
        
        // 2. Change 기안 -> 기안자
        content = content.replace(/<th style=\{\{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" \}\}>기안<\/th>/g, '<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>기안자</th>');

        // 3. Change dynamic 본부장 column to static <th ...>본부장</th>
        content = content.replace(/<th style=\{\{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" \}\}>\{\[[^{}]*\]\.includes\([^)]*\)\s*\?\s*"영업본부장"\s*:\s*"본부장"\}<\/th>/g, '<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>본부장</th>');

        // 4. Safely remove the 4th <td> from the `<tr style={{ height: "80px" }}>` block
        const trStart = content.indexOf('<tr style={{ height: "80px" }}>');
        if (trStart !== -1) {
            const trEnd = content.indexOf('</tr>', trStart);
            const trContent = content.substring(trStart, trEnd + 5);
            
            const tdParts = trContent.split('</td>');
            
            if (tdParts.length >= 5) {
                // Keep 0, 1, 2, and 4 (skip 3)
                const newTrContent = tdParts[0] + '</td>' + tdParts[1] + '</td>' + tdParts[2] + '</td>' + tdParts[4] + '</td>' + tdParts.slice(5).join('</td>');
                content = content.replace(trContent, newTrContent);
            }
        }
        
        fs.writeFileSync(file, content);
        console.log(`Updated ${dir}`);
    }
});
