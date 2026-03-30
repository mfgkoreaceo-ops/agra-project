require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emp = await prisma.user.findUnique({
        where: { employeeNumber: '202508022' }
    });
    console.log("Employee 202508022:", emp);
    
    // Also check any recent audit logs
    const logs = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { action: 'IMPORT_BULK' }
    });
    console.log("Recent bulk import logs:", logs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
