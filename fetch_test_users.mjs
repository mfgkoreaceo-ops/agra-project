import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        take: 3,
        select: {
            employeeNumber: true,
            name: true,
            phone: true,
            role: true,
            status: true,
            passwordHash: true
        }
    });

    const resignedUser = await prisma.user.findFirst({
        where: { status: 'RESIGNED' },
        select: { employeeNumber: true, name: true, phone: true }
    });
    
    console.log("Active Users:", users);
    console.log("Resigned User:", resignedUser);
}
main().finally(() => prisma.$disconnect());
