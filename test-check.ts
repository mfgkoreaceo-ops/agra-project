import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            name: true,
            healthCertificateUrl: true,
            idCardUrl: true,
        }
    });
    
    console.log("Users with health certificates:");
    for (const u of users) {
        if (u.healthCertificateUrl) {
            console.log(`- ${u.name}: Has Health Cert (len: ${u.healthCertificateUrl.length})`);
        }
        if (u.idCardUrl) {
            console.log(`- ${u.name}: Has ID Card (len: ${u.idCardUrl.length})`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
