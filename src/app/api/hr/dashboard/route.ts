import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const totalEmployees = await prisma.user.count({ where: { status: "ACTIVE" } });

        const pendingLeaves = await prisma.leaveRequest.count({
            where: { status: { in: ["PENDING", "PENDING_MGMT_HEAD", "PENDING_CEO"] } }
        });
        const pendingResignations = await prisma.resignationRecord.count({
            where: { status: { in: ["PENDING", "PENDING_MGMT_HEAD", "PENDING_CEO"] } }
        });
        const totalPending = pendingLeaves + pendingResignations;

        let myPending = 0;
        if (userId) {
            const myLeaves = await prisma.leaveRequest.count({
                where: { employeeId: userId, status: { in: ["PENDING", "PENDING_MGMT_HEAD", "PENDING_CEO"] } }
            });
            const myResignations = await prisma.resignationRecord.count({
                where: { employeeId: userId, status: { in: ["PENDING", "PENDING_MGMT_HEAD", "PENDING_CEO"] } }
            });
            myPending = myLeaves + myResignations;
        }

        // Calculate 30 days from now for health certificate expiration query
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringHealthCerts = await prisma.user.findMany({
            where: {
                status: "ACTIVE",
                brand: { not: "HQ" }, // Exclude HQ staff
                OR: [
                    { healthCertificateExp: null },
                    { healthCertificateExp: { lte: thirtyDaysFromNow } }
                ]
            },
            select: {
                id: true,
                name: true,
                storeName: true,
                healthCertificateExp: true
            },
            orderBy: {
                healthCertificateExp: 'asc'
            }
        });

        return NextResponse.json({
            totalEmployees,
            totalPending,
            myPending,
            expiringHealthCerts
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
