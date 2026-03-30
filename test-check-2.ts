import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: { name: '신선주' }
    });
    
    for (const u of users) {
        console.log(`URL for ${u.name}: ${u.healthCertificateUrl}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
