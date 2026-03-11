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
            whereClause = {
                OR: [
                    { employee: { storeName: requester.storeName, role: 'STAFF' }, status: 'PENDING_STORE_MANAGER' },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'SALES_TEAM_LEADER' || (requester.role === 'HQ_STAFF' && requester.department?.includes('영업'))) {
            whereClause = {
                OR: [
                    { employee: { role: 'STORE_MANAGER' }, status: 'PENDING_SALES_STAFF' },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HEAD_OF_SALES') {
            whereClause = {
                OR: [
                    { employee: { department: { contains: '영업' } }, status: 'PENDING_SALES_HEAD' },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HQ_TEAM_LEADER') {
            whereClause = {
                OR: [
                    { employee: { department: requester.department, role: 'HQ_STAFF' }, status: 'PENDING_TEAM_LEADER' },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HEAD_OF_MANAGEMENT') {
            whereClause = {
                OR: [
                    { employee: { role: 'HQ_TEAM_LEADER' }, status: 'PENDING_MGMT_HEAD' },
                    // Also HEAD_OF_MANAGEMENT usually acts as CEO proxy or handles execs
                    { status: 'PENDING_CEO' },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HR_ADMIN' || requester.jobTitle?.includes('최고경영자') || requester.jobTitle?.includes('대표이사')) {
            whereClause = {}; // CEO / HR Admin sees all
        } else {
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
        const { id, status, approverNotes, rejectionReason } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const existingRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!existingRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        const finalStatusToUpdate = status;

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: finalStatusToUpdate,
                rejectionReason: rejectionReason || null
            }
        });

        // Check if the leave type requires deducting from personal leave balance
        const isDeductible = ['ANNUAL', 'HALF_DAY', 'QUARTER_DAY'].includes(updated.leaveType);

        // Only deduct leave balances if it reaches the FINAL 'APPROVED' state and it's deductible
        if (finalStatusToUpdate === 'APPROVED' && existingRequest.status !== 'APPROVED' && isDeductible) {
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
                await prisma.leave.create({
                    data: {
                        employeeId: updated.employeeId,
                        year: currentYear,
                        totalDays: 15,
                        usedDays: updated.daysRequested
                    }
                });
            }
        } else if (status === 'REJECTED' && existingRequest.status === 'APPROVED' && isDeductible) {
            // HR forced rejection on an already approved request -> Refund the used days
            const currentYear = new Date(updated.startDate).getFullYear();

            const existingLeave = await prisma.leave.findFirst({
                where: { employeeId: updated.employeeId, year: currentYear }
            });

            if (existingLeave) {
                await prisma.leave.update({
                    where: { id: existingLeave.id },
                    data: { usedDays: { decrement: updated.daysRequested } }
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
        const { employeeNumber, startDate, endDate, daysRequested, reason, leaveType, leaveSubType, attachmentUrl } = body;

        const user = await prisma.user.findUnique({ where: { employeeNumber } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const requestDate = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        let initialStatus = "PENDING";

        // Define hierarchy mapping
        switch (user.role) {
            case 'STAFF':
                initialStatus = "PENDING_STORE_MANAGER";
                break;
            case 'STORE_MANAGER':
                initialStatus = "PENDING_SALES_STAFF";
                break;
            case 'SALES_TEAM_LEADER':
            case 'HQ_STAFF':
                if (user.department?.includes('영업')) {
                    initialStatus = "PENDING_SALES_HEAD";
                } else {
                    initialStatus = "PENDING_TEAM_LEADER";
                }
                break;
            case 'HQ_TEAM_LEADER':
                initialStatus = "PENDING_MGMT_HEAD";
                break;
            case 'HEAD_OF_MANAGEMENT':
            case 'HEAD_OF_SALES':
                initialStatus = "PENDING_CEO";
                break;
            case 'HR_ADMIN': // CEO / HR_ADMIN
                initialStatus = "APPROVED";
                break;
            default:
                initialStatus = "PENDING";
        }

        const newRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: user.id,
                startDate: start,
                endDate: end,
                daysRequested: Number(daysRequested),
                reason,
                leaveType: leaveType || "ANNUAL",
                leaveSubType: leaveSubType || null,
                attachmentUrl: attachmentUrl || null,
                status: initialStatus
            }
        });

        return NextResponse.json(newRequest);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const existingRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!existingRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        if (existingRequest.status !== 'PENDING' && !existingRequest.status.startsWith('PENDING')) {
            return NextResponse.json({ error: 'Cannot cancel an already processed request' }, { status: 400 });
        }

        await prisma.leaveRequest.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete leave request' }, { status: 500 });
    }
}

