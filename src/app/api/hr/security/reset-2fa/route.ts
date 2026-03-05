import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber } = body;

        if (!employeeNumber) {
            return NextResponse.json({ error: 'Employee number required' }, { status: 400 });
        }

        // Reset the 2FA status
        const updatedUser = await prisma.user.update({
            where: { employeeNumber },
            data: {
                is2faEnabled: false,
                twoFactorSecret: null,
            }
        });

        return NextResponse.json({ success: true, user: updatedUser.employeeNumber });
    } catch (error) {
        console.error('Failed to reset 2FA:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
