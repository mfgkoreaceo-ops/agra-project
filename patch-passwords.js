const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('1234', 10);
    const result = await prisma.user.updateMany({
        data: { passwordHash }
    });
    console.log(`Successfully reset passwords to 1234 for ${result.count} users.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
