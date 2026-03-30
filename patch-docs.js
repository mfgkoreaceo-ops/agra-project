const fs = require('fs');
const path = require('path');

// 1. Update wording in employees/page.tsx
const empPath = 'src/app/hr-portal-admin/employees/page.tsx';
if (fs.existsSync(empPath)) {
    let empStr = fs.readFileSync(empPath, 'utf8');
    empStr = empStr.replace(/상세 주민등록증\/신분증 사본/g, '신분증 사본');
    empStr = empStr.replace(/주민등록증 \/ 신분증 사본/g, '신분증 사본');
    empStr = empStr.replace(/급여 수령 통장 사본/g, '급여 통장 사본');
    fs.writeFileSync(empPath, empStr);
    console.log('employees/page.tsx wording updated.');
}

// 2. Base64 encoding in profile/page.tsx
const profileFile = 'src/app/hr-portal-admin/profile/page.tsx';
if (fs.existsSync(profileFile)) {
    let profileStr = fs.readFileSync(profileFile, 'utf8');
    
    if (!profileStr.includes('fileToBase64')) {
        profileStr = profileStr.replace(
            'const handleSaveInfo = async () => {', 
            `const fileToBase64 = (file: File | null): Promise<string | undefined> => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(undefined);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleSaveInfo = async () => {`
        );
        
        profileStr = profileStr.replace(
            'try {',
            `try {
            const idCardBase64 = await fileToBase64(idCardFile);
            const bankbookBase64 = await fileToBase64(bankbookFile);
            const healthCertBase64 = await fileToBase64(healthCertFile);`
        );
        
        // Use safer replace for fields
        profileStr = profileStr.replace(/idCardUrl:\s*idCardFile\s*\?\s*"uploaded"\s*:\s*undefined/g, 'idCardUrl: idCardBase64 !== undefined ? idCardBase64 : undefined');
        profileStr = profileStr.replace(/bankbookUrl:\s*bankbookFile\s*\?\s*"uploaded"\s*:\s*undefined/g, 'bankbookUrl: bankbookBase64 !== undefined ? bankbookBase64 : undefined');
        profileStr = profileStr.replace(/healthCertificateUrl:\s*healthCertFile\s*\?\s*"uploaded"\s*:\s*undefined/g, 'healthCertificateUrl: healthCertBase64 !== undefined ? healthCertBase64 : undefined');
        
        // Remove trailing comma from mock comment if it exists
        profileStr = profileStr.replace(/\/\/ simple mock representation/g, '');

        fs.writeFileSync(profileFile, profileStr);
        console.log('profile/page.tsx base64 encoding logic injected.');
    }
}

// 3. Update view links in team pages (health-certs, id-cards, bankbooks) and employees/page.tsx
const teamPages = [
    'src/app/hr-portal-admin/team/health-certs/page.tsx',
    'src/app/hr-portal-admin/team/id-cards/page.tsx',
    'src/app/hr-portal-admin/team/bankbooks/page.tsx',
    'src/app/hr-portal-admin/employees/page.tsx' // Add employees too just in case
];

teamPages.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // For grid pages
        content = content.replace(
            /<a href=\{r\["([a-zA-Z]+)" as keyof Employee\] as string\} target="_blank" rel="noreferrer" style=\{\{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 \}\}>/g,
            `<a href={String(r["$1" as keyof Employee] || "").startsWith("http") || String(r["$1" as keyof Employee] || "").startsWith("data:") ? (r["$1" as keyof Employee] as string) : "#"} onClick={(e) => { if(!String(r["$1" as keyof Employee] || "").startsWith("http") && !String(r["$1" as keyof Employee] || "").startsWith("data:")) { e.preventDefault(); alert("원본 파일이 유실되었거나 테스트용 임시 데이터입니다. 직원이 사본을 재업로드해야 합니다."); } }} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>`
        );
        
        // Wait, what if it's employees/page.tsx where the link is different?
        // Let's check employees/page.tsx link format
        if (file.includes('employees')) {
            content = content.replace(
                /<a href=\{selectedEmployee\.([a-zA-Z]+)\} target="_blank" rel="noopener noreferrer" style=\{\{ color: "#2563eb", textDecoration: "none" \}\}>/g,
                `<a href={String(selectedEmployee.$1 || "").startsWith("http") || String(selectedEmployee.$1 || "").startsWith("data:") ? selectedEmployee.$1 : "#"} onClick={(e) => { if(!String(selectedEmployee.$1 || "").startsWith("http") && !String(selectedEmployee.$1 || "").startsWith("data:")) { e.preventDefault(); alert("원본 파일이 유실되었거나 테스트용 임시 데이터입니다. 직원이 사본을 재업로드해야 합니다."); } }} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>`
            );
        }

        fs.writeFileSync(file, content);
        console.log(`View links patched in ${file}`);
    }
});
