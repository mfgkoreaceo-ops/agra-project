import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');

        if (employeeId) {
            // Get specific employee's resignation
            const resignation = await prisma.resignationRecord.findFirst({
                where: { employeeId },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(resignation);
        } else {
            // Get all resignations for HR Admin
            const resignations = await prisma.resignationRecord.findMany({
                include: { employee: true },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(resignations);
        }
    } catch (error) {
        console.error('Failed to fetch resignations:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { employeeId, resignationDate, reason, signatureData } = data;

        if (!employeeId || !resignationDate || !reason || !signatureData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Only create if we have the user
        const user = await prisma.user.findUnique({ where: { id: employeeId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let initialStatus = "PENDING";
        if (user.brand === "HQ") {
            if (user.jobTitle === "대표이사 (CEO)" || user.jobTitle === "전무/관리 본부장") {
                initialStatus = "APPROVED"; // executives auto approve their own resignation (logically handled)
            } else {
                initialStatus = "PENDING_MGMT_HEAD"; // 1차 관리 본부장 대기
            }
        }

        const newRecord = await prisma.resignationRecord.create({
            data: {
                employeeId,
                resignationDate: new Date(resignationDate),
                reason,
                signatureData,
                status: initialStatus
            }
        });

        return NextResponse.json({ success: true, resignation: newRecord });
    } catch (error) {
        console.error('Failed to create resignation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, status } = data; // status = APPROVED | REJECTED

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const existingRequest = await prisma.resignationRecord.findUnique({
            where: { id }
        });

        if (!existingRequest) {
            return NextResponse.json({ error: 'Resignation not found' }, { status: 404 });
        }

        let finalStatusToUpdate = status;
        if (status === 'APPROVED' && existingRequest.status === 'PENDING_MGMT_HEAD') {
            finalStatusToUpdate = 'PENDING_CEO';
        }

        const updateData: any = { status: finalStatusToUpdate };

        // Update resignation status
        const updated = await prisma.resignationRecord.update({
            where: { id },
            data: updateData,
            include: { employee: true }
        });

        // If approved, update user status to RESIGNED
        if (finalStatusToUpdate === 'APPROVED') {
            await prisma.user.update({
                where: { id: updated.employeeId },
                data: { status: 'RESIGNED' }
            });
        }

        return NextResponse.json({ success: true, resignation: updated });
    } catch (error) {
        console.error('Failed to update resignation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
