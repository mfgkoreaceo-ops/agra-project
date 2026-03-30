const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const pendingIncidentsRaw = await prisma.incidentReport.findMany({
            where: { status: "PENDING" },
            include: { employee: true },
            orderBy: { createdAt: 'desc' }
        });

        const incidentIds = pendingIncidentsRaw.map(i => i.id);
        const allIncidentSteps = await prisma.approvalStep.findMany({
            where: { documentType: "INCIDENT", documentId: { in: incidentIds } }
        });

        const pendingIncidentsList = pendingIncidentsRaw.map(inc => ({
            ...inc,
            approvalSteps: allIncidentSteps.filter(step => step.documentId === inc.id)
        }));
        
        console.log("Success! Fetched", pendingIncidentsList.length, "incidents safely.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
