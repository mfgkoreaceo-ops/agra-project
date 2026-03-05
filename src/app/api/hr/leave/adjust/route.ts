import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { employeeId, totalDays, usedDays, year } = body;

        if (!employeeId) {
            return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
        }

        const targetYear = year || new Date().getFullYear();

        // Find existing leave record or create one
        const leaveRecord = await prisma.leave.findFirst({
            where: { employeeId, year: targetYear }
        });

        if (leaveRecord) {
            const updated = await prisma.leave.update({
                where: { id: leaveRecord.id },
                data: {
                    totalDays: totalDays !== undefined ? totalDays : leaveRecord.totalDays,
                    usedDays: usedDays !== undefined ? usedDays : leaveRecord.usedDays,
                }
            });
            return NextResponse.json({ success: true, leave: updated });
        } else {
            const newRecord = await prisma.leave.create({
                data: {
                    employeeId,
                    year: targetYear,
                    totalDays: totalDays !== undefined ? totalDays : 15,
                    usedDays: usedDays !== undefined ? usedDays : 0,
                }
            });
            return NextResponse.json({ success: true, leave: newRecord });
        }
    } catch (error) {
        console.error('Failed to adjust leave:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const year = searchParams.get('year') ? parseInt(searchParams.get('year') as string) : new Date().getFullYear();

        if (!employeeId) {
            return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
        }

        let leaveRecord = await prisma.leave.findFirst({
            where: { employeeId, year }
        });

        if (!leaveRecord) {
            // Provide a default 0/15 if it hasn't been created yet
            leaveRecord = {
                id: 'temp',
                employeeId,
                year,
                totalDays: 15,
                usedDays: 0
            };
        }

        return NextResponse.json({ success: true, leave: leaveRecord });
    } catch (error) {
        console.error('Failed to get leave:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
