const fs = require('fs');
const path = require('path');

function performReplacements(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const rep of replacements) {
        if (content.includes(rep.from)) {
            content = content.split(rep.from).join(rep.to);
        } else {
            console.warn(`WARNING: String not found in ${filePath}:`, rep.from);
        }
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully updated:', filePath);
    }
}

const basePath = path.join(__dirname, 'src', 'app', 'hr-portal-admin');

const tasks = [
    {
        file: 'security/page.tsx',
        replacements: [
            { from: '매장명으로 검색', to: '매장명 / 팀으로 검색' }
        ]
    },
    {
        file: 'permissions/page.tsx',
        replacements: [
            { from: '매장명, 부서로 검색...', to: '매장명 / 팀, 부서로 검색...' },
            { from: '<span>직급 <SortIcon', to: '<span>직책 / 직급 <SortIcon' }
        ]
    },
    {
        file: 'leave/page.tsx',
        replacements: [
            { from: '매장명 검색', to: '매장명 / 팀 검색' },
            { from: '<span>직급 {renderSortIcon', to: '<span>직책 / 직급 {renderSortIcon' }
        ]
    },
    {
        file: 'employees/page.tsx',
        replacements: [
            { from: '매장명 검색', to: '매장명 / 팀 검색' },
            { from: '<p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>매장명 (브랜드)</p>', to: '<p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>매장명 / 팀 (브랜드)</p>' },
            { from: '<p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>직급</p>', to: '<p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>직책 / 직급</p>' },
            { from: '직급/직책 선택', to: '직책 / 직급 선택' }
        ]
    },
    {
        file: 'certificates-self/page.tsx',
        replacements: [
            { from: '소속 선택 (매장명)', to: '소속 선택 (매장명 / 팀)' }
        ]
    },
    {
        file: 'team/stores/page.tsx',
        replacements: [
            { from: '<th>매장명</th>', to: '<th>매장명 / 팀</th>' },
            { from: 'placeholder="매장명 (필수)"', to: 'placeholder="매장명 / 팀 (필수)"' },
            { from: '<strong>매장명</strong> (필수)', to: '<strong>매장명 / 팀</strong> (필수)' },
            { from: '<th>매장명(ERP)</th>', to: '<th>매장명(ERP) / 팀</th>' }, // Keep consistency with other ERP header
            { from: 'placeholder="매장명(ERP)"', to: 'placeholder="매장명(ERP) / 팀"' },
            { from: '<strong>매장명(ERP)</strong> (선택)', to: '<strong>매장명(ERP) / 팀</strong> (선택)' }
        ]
    },
    {
        file: 'team/leave-status/page.tsx',
        replacements: [
            { from: '직급 <SortIcon', to: '직책 / 직급 <SortIcon' }
        ]
    },
    {
        file: 'resignations/page.tsx',
        replacements: [
            { from: '<span>직급 <ArrowUpDown', to: '<span>직책 / 직급 <ArrowUpDown' },
            { from: '<th>직급 및 성명</th>', to: '<th>직책 / 직급 및 성명</th>' },
            { from: 'th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>직급 및 성명</th>', to: 'th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>직책 / 직급 및 성명</th>' }
        ]
    },
    {
        file: 'resignation-self/page.tsx',
        replacements: [
            { from: '소속 / 직급', to: '소속 / 직책 / 직급' }
        ]
    },
    {
        file: 'incidents/page.tsx',
        replacements: [
            { from: '<span>직급 <ArrowUpDown', to: '<span>직책 / 직급 <ArrowUpDown' },
            { from: '<th>직급 및 성명</th>', to: '<th>직책 / 직급 및 성명</th>' },
            { from: 'th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>직급 및 성명</th>', to: 'th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>직책 / 직급 및 성명</th>' }
        ]
    },
    {
        file: 'incident-self/page.tsx',
        replacements: [
            { from: '소속 / 직급', to: '소속 / 직책 / 직급' }
        ]
    },
    {
        file: 'certificates/page.tsx',
        replacements: [
            { from: '직급 {renderSortIcon', to: '직책 / 직급 {renderSortIcon' }
        ]
    }
];

tasks.forEach(task => {
    performReplacements(path.join(basePath, task.file), task.replacements);
});
