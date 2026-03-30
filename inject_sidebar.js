const fs = require('fs');
let layout = fs.readFileSync('src/app/hr-portal-admin/layout.tsx', 'utf8');

const newLinks = `
                                                <li>
                                                    <Link href="/hr-portal-admin/team/id-cards" className={\`hr-submenu-item \${isActive('/hr-portal-admin/team/id-cards') ? 'active' : ''}\`}>
                                                        임직원 신분증
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/hr-portal-admin/team/bankbooks" className={\`hr-submenu-item \${isActive('/hr-portal-admin/team/bankbooks') ? 'active' : ''}\`}>
                                                        임직원 통장사본
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/hr-portal-admin/team/health-certs" className={\`hr-submenu-item \${isActive('/hr-portal-admin/team/health-certs') ? 'active' : ''}\`}>
                                                        임직원 보건증
                                                    </Link>
                                                </li>`;

// Insert after 통합 임직원 명부 link
const targetAnchor = `<Link href="/hr-portal-admin/employees" className={\`hr-submenu-item \${isActive('/hr-portal-admin/employees') ? 'active' : ''}\`}>
                                                        통합 임직원 명부
                                                    </Link>
                                                </li>`;

if (layout.includes(targetAnchor) && !layout.includes('/hr-portal-admin/team/id-cards')) {
    layout = layout.replace(targetAnchor, targetAnchor + newLinks);
    fs.writeFileSync('src/app/hr-portal-admin/layout.tsx', layout);
    console.log('Sidebar updated');
} else {
    console.log('Target anchor missing or already injected');
}
