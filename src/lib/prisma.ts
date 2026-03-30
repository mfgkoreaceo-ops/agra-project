import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma_v2: PrismaClient | undefined
}

const getPrismaClient = () => {
    let url = process.env.DATABASE_URL;
    if (url && url.includes('supabase.com') && url.includes(':5432')) {
        url = url.replace(':5432', ':6543');
        if (!url.includes('pgbouncer=true')) {
            url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
        }
    }
    return new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
};

export const prisma = globalForPrisma.prisma_v2 ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma
