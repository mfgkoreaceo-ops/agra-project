const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const auth = await prisma.user.findFirst({ where: { name: '김인사' } });
    console.log(`Total users: ${total}`);
    console.log(`Active users: ${active}`);
    console.log('Admin user:', auth);
}
main().catch(console.error).finally(() => prisma.$disconnect());
