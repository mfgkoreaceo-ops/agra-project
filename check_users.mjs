import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                employeeNumber: true,
                name: true,
                role: true,
                storeName: true,
            },
            take: 20
        });
        const total = await prisma.user.count();
        console.log(`Total users in DB: ${total}`);
        console.log('Sample users:');
        console.table(users);

        // Let's specifically look for general staff or managers
        const staff = await prisma.user.findFirst({ where: { role: 'STAFF' } });
        const manager = await prisma.user.findFirst({ where: { role: 'STORE_MANAGER' } });

        console.log('\nSample STAFF:', staff ? staff.employeeNumber : 'Not found');
        console.log('Sample STORE_MANAGER:', manager ? manager.employeeNumber : 'Not found');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
