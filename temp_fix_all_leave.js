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
        console.log("Checking all users joinedAt dates...");

        // Find users who joined in 2026 (this causes 0 leave days due to < 1 year)
        const recentUsers = await prisma.user.findMany({
            where: {
                joinedAt: {
                    gte: new Date('2026-01-01')
                }
            }
        });

        console.log(`Found ${recentUsers.length} users with joinedAt in 2026 or later.`);

        if (recentUsers.length > 0) {
            console.log("Updating their joinedAt to 2025-01-01...");
            const updateRes = await prisma.user.updateMany({
                where: {
                    id: { in: recentUsers.map(u => u.id) }
                },
                data: { joinedAt: new Date('2025-01-01') }
            });
            console.log("Updated users:", updateRes.count);

            console.log("Deleting any generated 2026 leave records with 0 days...");
            const deleteRes = await prisma.leave.deleteMany({
                where: {
                    employeeId: { in: recentUsers.map(u => u.id) },
                    year: 2026,
                    totalDays: 0
                }
            });
            console.log("Deleted records:", deleteRes.count);
        }

        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
