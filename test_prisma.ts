const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Updating store...");
        const result = await prisma.store.update({
            where: { id: "cmmycwkrw000pld049ruihsaw" },
            data: { erpName: "test" }
        });
        console.log("Success:", result);
    } catch (error) {
        console.error("Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}
test();
