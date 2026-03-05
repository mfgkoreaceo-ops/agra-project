import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const totalEmployees = await prisma.user.count({ where: { status: "ACTIVE" } });
        const totalLeaves = await prisma.leaveRequest.count({ where: { status: "PENDING" } });

        return NextResponse.json({
            totalEmployees,
            totalLeaves
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
