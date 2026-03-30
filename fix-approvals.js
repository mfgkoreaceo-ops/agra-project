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

        // Replace th header row
        // Look for the block of <th> inside the signature table
        const thBlockRegex = /<tr[^>]*>\s*<th[^>]*>기안<\/th>\s*<th[^>]*>관리자<\/th>\s*<th[^>]*>\{[^}]+\}\s*\?\s*"영업본부장"\s*:\s*"본부장"\}<\/th>\s*<th[^>]*>인사부문<\/th>\s*<th[^>]*>대표이사<\/th>\s*<\/tr>/g;
        
        let newThBlock = `<tr>
                                                <th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>기안자</th>
                                                <th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>관리자</th>
                                                <th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>본부장</th>
                                                <th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>대표이사</th>
                                            </tr>`;
        
        // Sometimes "기안자" might already be partially there, let's do a more robust string replacement
        // Removing the hr column:
        content = content.replace(/<th[^>]*>인사부문<\/th>/g, '');
        content = content.replace(/<th[^>]*>기안<\/th>/g, '<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>기안자</th>');
        content = content.replace(/<th[^>]*>\{[^}]+\}\s*\?\s*"영업본부장"\s*:\s*"본부장"\}<\/th>/g, '<th style={{ border: "1px solid #111827", padding: "0.5rem", backgroundColor: "#f9fafb", fontSize: "0.85rem", width: "80px", color: "#000000" }}>본부장</th>');
        
        // Also fix the <td> tags to remove the HR column!
        // The HR column is the 4th td in a row of 5 td's.
        // It's the one that has PENDING_HR logic.
        
        // The regex captures td 1, 2, 3, 4, 5
        const trTdRegex = /(<tr style={{ height: "80px" }}>\s*<td[\s\S]*?<\/td>\s*<td[\s\S]*?<\/td>\s*<td[\s\S]*?<\/td>\s*)<td[\s\S]*?(PENDING_HR|인사부문 최종|HR)[\s\S]*?<\/td>\s*(<td[\s\S]*?<\/td>\s*<\/tr>)/g;
        
        content = content.replace(trTdRegex, '$1$3');

        // Also fix "기안자 성명 / 사번" since the user requested changes in the ApprovalLineBuilder... no wait, user asked to remove "인사부문" from ONLY the box? Or everywhere? "전자결재 결재박스 기안자, 관리자, 본부장, 대표이사 로 변경해주고 인사부문 삭제해줘(모든 결재)" implies the signature boxes.

        // Also some pages might have a static `<th>인사부문</th>` which was caught by replace above.
        // What about the TD for HR?
        const fallbackTdRegex = /(<td style={{ border: "1px solid #111827", verticalAlign: "middle" }}>\s*(?:\{\s*isExecutive\s*\?\s*\([\s\S]*?\)\s*:\s*\([\s\S]*?PENDING_HR[\s\S]*?\)\s*\}|[\s\S]*?PENDING_HR[\s\S]*?)\s*<\/td>)/g;
        
        // Actually, it's safer to just remove any TD that checks for PENDING_HR in the signature row.
        // Let's manually replace the 4th TD in the 80px row block for all files.
        /* Notice in leave-self:
        // TD 1: 기안
        // TD 2: 관리자
        // TD 3: 본부장
        // TD 4: 인사팀 (PENDING_HR)
        // TD 5: 대표이사 (PENDING_CEO)
        */
        
        fs.writeFileSync(file, content);
        console.log(`Updated ${dir}`);
    }
});
