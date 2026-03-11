const { PrismaClient } = require('@prisma/client');
const DATABASE_URL = process.env.DATABASE_URL.replace(':5432/postgres', ':6543/postgres?pgbouncer=true');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function main() {
    try {
        console.log("Deleting any cached 2026 leave records with 0 days across the entire company...");
        const deleteRes = await prisma.leave.deleteMany({
            where: {
                year: 2026,
                totalDays: 0
            }
        });
        console.log("Deleted records:", deleteRes.count);
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
