import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeNumber = searchParams.get('employeeNumber');

        if (!employeeNumber) {
            return NextResponse.json({ error: 'Missing employeeNumber' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { employeeNumber } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentYear = new Date().getFullYear();
        let leave = await prisma.leave.findFirst({
            where: { employeeId: user.id, year: currentYear }
        });

        if (!leave) {
            leave = await prisma.leave.create({
                data: {
                    employeeId: user.id,
                    year: currentYear,
                    totalDays: 15,
                    usedDays: 0
                }
            });
        }

        return NextResponse.json(leave);
    } catch (error) {
        console.error('Failed to fetch leave balance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
