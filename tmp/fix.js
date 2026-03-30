const fs = require('fs');
const path = 'src/app/hr-portal-admin/incidents/page.tsx';
let txt = fs.readFileSync(path, 'utf8');
let lines = txt.split('\n');
lines = lines.slice(0, 696);
fs.writeFileSync(path, lines.join('\n'), 'utf8');
