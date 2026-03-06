import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.updateMany({
        where: { name: '윤나라' },
        data: {
            phone: '01056620349',
            bankName: '국민은행',
            idCardUrl: null
        }
    });
    console.log('Updated Yoon Nara info');
}

main().finally(() => prisma.$disconnect());
