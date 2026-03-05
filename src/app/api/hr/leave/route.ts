import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requesterId = searchParams.get('requesterId');
        const view = searchParams.get('view');

        if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const requester = await prisma.user.findUnique({ where: { employeeNumber: requesterId } });
        if (!requester) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let whereClause: any = {};

        if (view === 'self') {
            whereClause = { employeeId: requester.id };
        } else if (requester.role === 'STORE_MANAGER') {
            // Managers only see STAFF from their own store, or their own requests
            whereClause = {
                OR: [
                    { employee: { storeName: requester.storeName, role: 'STAFF' } },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'SALES_TEAM_LEADER') {
            // Sales Team Leaders see STORE_MANAGERS from all stores, and their own requests
            whereClause = {
                OR: [
                    { employee: { role: 'STORE_MANAGER' } },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HEAD_OF_SALES') {
            // Head of sales sees SALES_TEAM_LEADERS and their own
            whereClause = {
                OR: [
                    { employee: { role: 'SALES_TEAM_LEADER' } },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HQ_TEAM_LEADER') {
            // HQ Team Leader sees their department HQ_STAFF and their own
            whereClause = {
                OR: [
                    { employee: { department: requester.department, role: 'HQ_STAFF' } },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HEAD_OF_MANAGEMENT') {
            // Head of Management sees HQ_TEAM_LEADERS
            whereClause = {
                OR: [
                    { employee: { role: 'HQ_TEAM_LEADER' } },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HR_ADMIN') {
            // HR sees everyone (or specific top-level roles depending on definition, but usually everyone for audit)
            whereClause = {};
        } else {
            // STAFF sees only their own
            whereClause = { employeeId: requester.id };
        }

        const requests = await prisma.leaveRequest.findMany({
            where: whereClause,
            orderBy: { startDate: 'desc' },
            include: {
                employee: {
                    select: { name: true, employeeNumber: true, storeName: true, department: true }
                }
            }
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status, approverNotes } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: { status }
        });

        if (status === 'APPROVED') {
            const currentYear = new Date(updated.startDate).getFullYear();

            // Look for existing Leave record for this year
            const existingLeave = await prisma.leave.findFirst({
                where: { employeeId: updated.employeeId, year: currentYear }
            });

            if (existingLeave) {
                await prisma.leave.update({
                    where: { id: existingLeave.id },
                    data: { usedDays: { increment: updated.daysRequested } }
                });
            } else {
                // If it doesn't exist, create a new one assuming 15 total days
                await prisma.leave.create({
                    data: {
                        employeeId: updated.employeeId,
                        year: currentYear,
                        totalDays: 15,
                        usedDays: updated.daysRequested
                    }
                });
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, startDate, endDate, daysRequested, reason, leaveType } = body;

        const user = await prisma.user.findUnique({ where: { employeeNumber } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const requestDate = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const newRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: user.id,
                startDate: start,
                endDate: end,
                daysRequested: Number(daysRequested),
                reason,
                leaveType: leaveType || "ANNUAL",
                status: "PENDING"
            }
        });

        return NextResponse.json(newRequest);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }
}
