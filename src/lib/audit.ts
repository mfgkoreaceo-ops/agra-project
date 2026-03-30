import { prisma } from '@/lib/prisma';

export async function logAudit(
    actorId: string | null,
    actorName: string | null,
    actionType: string,
    resource: string,
    resourceId?: string | null,
    details?: string | null
) {
    try {
        await prisma.auditLog.create({
            data: {
                actorId,
                actorName,
                actionType,
                resource,
                resourceId,
                details
            }
        });
    } catch (e) {
        console.error("Failed to log audit", e);
    }
}
