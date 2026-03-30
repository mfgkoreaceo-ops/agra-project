const fs = require('fs');
const path = require('path');

// 1. Fix Layout
const layoutFile = 'src/app/hr-portal-admin/layout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
layoutContent = layoutContent.replace('AGRA/NOYA HR 통합 시스템(HQ)', 'AGRA/NOYA HR 통합 시스템');

if (layoutContent.includes('.hr-sidebar {\\n                        position: fixed;')) {
    layoutContent = layoutContent.replace(
        '.hr-sidebar {\\n                        position: fixed;',
        '.hr-sidebar {\\n                        position: fixed;\\n                        overflow-y: auto;'
    );
} else if (!layoutContent.includes('overflow-y: auto;')) {
    // Just inject it into the generic .hr-sidebar if there is one
    layoutContent = layoutContent.replace(
        '.hr-sidebar {\\n                    width: 250px;',
        '.hr-sidebar {\\n                    width: 250px;\\n                    overflow-y: auto;'
    );
}

fs.writeFileSync(layoutFile, layoutContent);
console.log('Fixed layout.tsx');

// 2. Fix Dashboard Wordings
const dashboardFile = 'src/app/hr-portal-admin/dashboard/page.tsx';
let dashContent = fs.readFileSync(dashboardFile, 'utf8');
dashContent = dashContent.replace(/결재함\(나의 승인 대기 목록\)/g, '결재함');
fs.writeFileSync(dashboardFile, dashContent);
console.log('Fixed dashboard wording');

// 3. Fix Flex Wrap on all list pages
const dirs = [
    'leave-self', 'leave', 
    'certificates-self', 'certificates', 
    'resignation-self', 'resignations', 
    'incident-self', 'incidents',
    'dashboard'
];

dirs.forEach(dir => {
    const file = path.join('src/app/hr-portal-admin', dir, 'page.tsx');
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(
            /marginBottom:\s*"2rem",\s*display:\s*"flex",\s*justifyContent:\s*"space-between",\s*alignItems:\s*"flex-end"/g,
            'marginBottom: "2rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "flex-start"'
        );
        content = content.replace(
            /marginBottom:\s*'2rem',\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'flex-end'/g,
            "marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start'"
        );
        fs.writeFileSync(file, content);
        console.log(`Fixed flex layout in ${dir}`);
    }
});
