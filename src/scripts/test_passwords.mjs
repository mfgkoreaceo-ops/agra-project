import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        where: {
            employeeNumber: { in: ['20260001', '201602001', '202109021', '20240001'] }
        }
    });

    for (const u of users) {
        console.log(`Checking ${u.name} (${u.employeeNumber})...`);
        const is1234 = await bcrypt.compare('1234', u.passwordHash);
        const isAgra = await bcrypt.compare('Agra1234!', u.passwordHash);
        console.log(`  Password '1234': ${is1234}`);
        console.log(`  Password 'Agra1234!': ${isAgra}`);
    }
}

check().then(() => prisma.$disconnect());
