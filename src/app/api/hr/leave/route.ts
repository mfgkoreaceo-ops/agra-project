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
            // 본부장은 본사(HQ) 직원 전체의 1차 상신을 확인 가능
            whereClause = {
                OR: [
                    { employee: { brand: 'HQ', role: { notIn: ['HR_ADMIN', 'HEAD_OF_MANAGEMENT'] } } },
                    { employeeId: requester.id }
                ]
            };
        } else if (requester.role === 'HR_ADMIN') {
            // 대표이사(CEO) 및 인사팀은 전사 확인 가능
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

        // HQ Hierarchy Logic:
        // If it's PENDING_MGMT_HEAD and someone approves it, it becomes PENDING_CEO
        let finalStatusToUpdate = status;
        if (status === 'APPROVED' && existingRequest.status === 'PENDING_MGMT_HEAD') {
            finalStatusToUpdate = 'PENDING_CEO';
        }

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: finalStatusToUpdate,
                rejectionReason: rejectionReason || null
            }
        });

        // Only deduct leave balances if it reaches the FINAL 'APPROVED' state
        if (finalStatusToUpdate === 'APPROVED' && existingRequest.status !== 'APPROVED') {
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
        } else if (status === 'REJECTED' && existingRequest.status === 'APPROVED') {
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
        const { employeeNumber, startDate, endDate, daysRequested, reason, leaveType } = body;

        const user = await prisma.user.findUnique({ where: { employeeNumber } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const requestDate = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate initial status based on hierarchy logic for HQ vs Store
        let initialStatus = "PENDING";
        if (user.brand === "HQ") {
            if (user.jobTitle === "대표이사 (CEO)" || user.jobTitle === "전무/관리 본부장") {
                initialStatus = "APPROVED"; // executives auto approve their own records
            } else {
                initialStatus = "PENDING_MGMT_HEAD"; // 1차 관리 본부장 대기
            }
        }

        const newRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: user.id,
                startDate: start,
                endDate: end,
                daysRequested: Number(daysRequested),
                reason,
                leaveType: leaveType || "ANNUAL",
                status: initialStatus
            }
        });

        return NextResponse.json(newRequest);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }
}
