const fs = require('fs');
const file = 'src/app/api/hr/profile/route.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `    try {
        const { searchParams } = new URL(request.url);
        const employeeNumber = searchParams.get('employeeNumber');
        const id = searchParams.get('id');

        if ((!employeeNumber || employeeNumber === 'undefined') && (!id || id === 'undefined')) {
            return NextResponse.json({ error: 'Missing employeeNumber or id' }, { status: 400 });
        }

        const whereClause = (employeeNumber && employeeNumber !== 'undefined') 
            ? { employeeNumber } 
            : { id };

        const user = await prisma.user.findUnique({
            where: whereClause,`;

// We'll replace lines 8 to 20.
// Let's just find "try {" and "select: {"
const startIndex = content.indexOf('    try {');
const endIndex = content.indexOf('            select: {', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const originalPart = content.substring(startIndex, endIndex);
    content = content.replace(originalPart, replacement + '\\n');
    fs.writeFileSync(file, content);
    console.log('API fixed');
} else {
    console.log('Failed to find');
}
