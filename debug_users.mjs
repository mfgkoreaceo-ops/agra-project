import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Fetching users...");
    const users = await prisma.user.findMany({
        where: {
            status: 'ACTIVE',
            role: { not: 'HR_ADMIN' }
        },
        select: {
            employeeNumber: true,
            name: true,
            role: true,
            status: true
        }
    });
    console.log(`Found ${users.length} delegable active users`);
    console.log(users);
}
main().finally(() => prisma.$disconnect());
