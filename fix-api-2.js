const fs = require('fs');
let s = fs.readFileSync('src/app/api/hr/profile/route.ts', 'utf8');
s = s.replace('where: whereClause,\\n            select: {', 'where: whereClause,\\n            select: {'.replace('\\\\n', '\\n'));
fs.writeFileSync('src/app/api/hr/profile/route.ts', s);
