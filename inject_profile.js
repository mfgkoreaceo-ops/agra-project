const fs = require('fs');
const file = 'src/app/hr-portal-admin/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const helper = `const getSmartStoreDepartmentDisplay = (emp: any) => {
    if (!emp) return '-';
    const store = emp.storeName?.trim() || "";
    const dept = emp.department?.trim() || "";

    if (!dept || dept === '-') return store || "미등록";
    if (!store || store === '-') return dept || "미등록";

    if (store === dept) return store;
    if (store === '본사') return dept;
    if (store.includes(dept)) return store;
    if (dept.includes(store)) return dept;

    return \`\${store} / \${dept}\`;
};

export default function MyProfilePage() {`;

content = content.replace("export default function MyProfilePage() {", helper);

content = content.replace(
    /fetch\(`\/api\/hr\/profile\?employeeNumber=\$\{parsedUser\.employeeNumber\}`\)/,
    "fetch(`/api/hr/profile?employeeNumber=${parsedUser.employeeNumber}&id=${parsedUser.id}`)"
);

// Replace Brand Dropdown
const brandRegex = /<select value=\{editBrand\} onChange=\{\(e\) => setEditBrand\(e\.target\.value\)\} style=\{\{([^}]*)\}\}>[\s\S]*?<\/select>/;
content = content.replace(brandRegex, `<input type="text" value={user.brand || "미등록"} readOnly disabled style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem", backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "not-allowed", outline: "none" }} />`);

// Replace JobTitle Dropdown
const jobTitleRegex = /<select value=\{editJobTitle\} onChange=\{\(e\) => setEditJobTitle\(e\.target\.value\)\} style=\{\{([^}]*)\}\}>[\s\S]*?<\/select>/;
content = content.replace(jobTitleRegex, `<input type="text" value={user.jobTitle || user.role || "미등록"} readOnly disabled style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem", backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "not-allowed", outline: "none" }} />`);

// Replace Store Name Dropdown
const storeNameRegex = /<select value=\{editStoreName\} onChange=\{\(e\) => setEditStoreName\(e\.target\.value\)\} style=\{\{([^}]*)\}\}>[\s\S]*?<\/select>/;
content = content.replace(storeNameRegex, `<input type="text" value={getSmartStoreDepartmentDisplay(user)} readOnly disabled style={{ width: "100%", padding: "0.85rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem", backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "not-allowed", outline: "none" }} />`);

// Replace Display Paragraph
content = content.replace(
    /\{user\.department \|\| user\.storeName \|\| user\.storeId \|\| "미등록"\}/,
    "{getSmartStoreDepartmentDisplay(user)}"
);

fs.writeFileSync(file, content);
console.log('Profile Injection Complete');
