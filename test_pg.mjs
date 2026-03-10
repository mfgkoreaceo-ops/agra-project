import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.xljsmqsmwvfkxfnoxcos:bYXzUAdp@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'
        }
    }
});

async function test() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("SUCCESS");
    } catch (e) {
        console.error("FAIL", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
