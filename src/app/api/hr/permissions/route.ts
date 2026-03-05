import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const allDelegable = await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                role: { not: 'HR_ADMIN' }
            },
            select: {
                 id: true,
                 employeeNumber: true,
                 name: true,
                 brand: true,
                 storeName: true,
                 department: true,
                 role: true,
                 canManageNotices: true,
                 canManageLeaves: true,
                 canManagePayroll: true
            },
            orderBy: [
                { brand: 'asc' },
                { storeName: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({ success: true, users: allDelegable });
    } catch (error: any) {
        console.error('Failed to fetch permissions:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, permissions } = body;

        if (!employeeNumber || !permissions) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { employeeNumber },
            data: {
                canManageNotices: permissions.canManageNotices,
                canManageLeaves: permissions.canManageLeaves,
                canManagePayroll: permissions.canManagePayroll
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Failed to update permissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
