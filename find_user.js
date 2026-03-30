const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: { name: { contains: '유혜빈' } }
    });
    console.log(users.map(u => ({ name: u.name, empNumber: u.employeeNumber, role: u.role, dept: u.department, store: u.storeName })));
}

main().finally(() => prisma.$disconnect());
