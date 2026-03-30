const fs = require('fs');
const path = require('path');

// 1. Profile Page
const profilePath = 'src/app/hr-portal-admin/profile/page.tsx';
let content = fs.readFileSync(profilePath, 'utf8');

const replacements = [
    [/주민등록증 \/ 신분증 사본 \(입사 구비용\)/g, '신분증 사본'],
    [/인사 기록용 신분증 사본/g, '신분증 사본'],
    [/개인 통장 사본 \(급여 이체용\)/g, '통장 사본'],
    [/급여 이체용 통장 사본/g, '통장 사본'],
    [/서류 보건증 \(유효기간\)/g, '보건증'],
    [/서류 보건증 \/ 유효기간/g, '보건증'],
    [/보건증 \(업종별 요건\)/g, '보건증'],
    [/급여 수령 계좌/g, '급여 계좌'],
    [/급여 수령 은행명/g, '급여 계좌 은행명'],
    [/급여 계좌번호/g, '급여 계좌번호'], // Keep unchanged or just let other replace handle it
    [/정보 갱신 및 사본 업데이트/g, '정보 업데이트'],
    [/현 거주지 주소/g, '거주지 주소'],
    [/휴대폰 연락처/g, '연락처'],
    [/개인 이메일/g, '이메일']
];

replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
});

// Also fix the edit labels if they use other strings
content = content.replace(/연락처 \(휴대폰\)/g, '연락처');

fs.writeFileSync(profilePath, content);
console.log('Profile page patched.');

// 2. Health Certs Page D-30 Red logic
const healthCertsPath = 'src/app/hr-portal-admin/team/health-certs/page.tsx';
let hcContent = fs.readFileSync(healthCertsPath, 'utf8');

const d30Function = `
const getExpStyle = (expDate: string | null | undefined) => {
    if (!expDate) return { padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#4b5563" };
    const date = new Date(expDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
        return { padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#dc2626", fontWeight: "bold" };
    }
    return { padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#4b5563" };
};
`;

if (!hcContent.includes('const getExpStyle')) {
    hcContent = hcContent.replace('export default function DocumentTrackerPage() {', d30Function + '\\nexport default function DocumentTrackerPage() {');
}

const targetTd = '<td style={{ padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#4b5563" }}>\\n                                    {r.healthCertificateExp ? new Date(r.healthCertificateExp).toLocaleDateString() : "-"}\\n                                </td>';
const replacementTd = '<td style={getExpStyle(r.healthCertificateExp) as React.CSSProperties}>\\n                                    {r.healthCertificateExp ? new Date(r.healthCertificateExp).toLocaleDateString() : "-"}\\n                                </td>';

if (hcContent.includes(targetTd)) {
    hcContent = hcContent.replace(targetTd, replacementTd);
    fs.writeFileSync(healthCertsPath, hcContent);
    console.log('Health certs page patched.');
} else {
    // try softer match
    hcContent = hcContent.replace(
        /<td style=\{\{ padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#4b5563" \}\}>\s*\{r\.healthCertificateExp \? new Date\(r\.healthCertificateExp\)\.toLocaleDateString\(\) : "-"\}\s*<\/td>/g,
        replacementTd
    );
    fs.writeFileSync(healthCertsPath, hcContent);
    console.log('Health certs page patched with regex.');
}
