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

        // Note: The th row is mostly identical across files, except for the role array inside the 3rd th.
        // We can just replace the entire `<tr>` block that contains the `<th>` tags for the signature line.
        // We'll split the content to find the `<tr>` that contains `<th>기안</th>`.

        // Replace TH Row
        const oldThRow1 = `<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>기안</th>`;
        const oldThRow2 = `<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>관리자</th>`;
        const oldThRow4 = `<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>인사부문</th>`;
        
        content = content.replace(oldThRow1, `<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>기안자</th>`);
        content = content.replace(oldThRow4, ""); // Remove 인사부문

        content = content.replace(
            `{["STAFF", "STORE_MANAGER", "KITCHEN_MANAGER", "HALL_MANAGER", "SALES_TEAM_LEADER"].includes(currentUser?.role) ? "영업본부장" : "본부장"}`,
            `"본부장"`
        );
        content = content.replace(
            `{["STAFF", "STORE_MANAGER", "KITCHEN_MANAGER", "HALL_MANAGER", "SALES_TEAM_LEADER"].includes(selectedRecord.employee.role) ? "영업본부장" : "본부장"}`,
            `"본부장"`
        );

        // Replace TD Row
        // The 4th TD is the HR block. We need to find EXACTLY the 4th TD in the `tr` that has `height: "80px"`.
        // Since we know the block starts with `<tr style={{ height: "80px" }}>`, we can find it and slice it.
        const lines = content.split('\\n');
        let newLines = [];
        let inTr = false;
        let tdCount = 0;
        let skipMode = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('<tr style={{ height: "80px" }}>')) {
                inTr = true;
                tdCount = 0;
                newLines.push(line);
                continue;
            }
            
            if (inTr) {
                if (line.includes('<td style={{ border: "1px solid #111827", verticalAlign: "middle" }}>')) {
                    tdCount++;
                    if (tdCount === 4) {
                        skipMode = true; // Start skipping lines for the 4th TD
                    }
                }
                
                if (skipMode) {
                    if (line.includes('</td>')) {
                        skipMode = false; // Stop skipping after the 4th TD ends
                    }
                    continue; // Skip pushing this line
                }
                
                if (line.includes('</tr>')) {
                    inTr = false;
                }
            }
            
            if (!skipMode) {
                newLines.push(line);
            }
        }

        let newContent = newLines.join('\\n');

        fs.writeFileSync(file, newContent);
        console.log(\`Safely updated \${dir}\`);
    }
});
