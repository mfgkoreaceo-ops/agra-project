import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { employeeId, adminId, newPassword } = body;

        if (!employeeId || !adminId || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify admin permissions
        const admin = await prisma.user.findUnique({ where: { employeeNumber: adminId } });
        if (!admin || !['HR_ADMIN', 'HEAD_OF_MANAGEMENT'].includes(admin.role)) {
            return NextResponse.json({ error: 'Unauthorized to change passwords' }, { status: 403 });
        }

        // Verify target employee exists
        const targetEmployee = await prisma.user.findUnique({ where: { id: employeeId } });
        if (!targetEmployee) {
            return NextResponse.json({ error: 'Target employee not found' }, { status: 404 });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await prisma.user.update({
            where: { id: employeeId },
            data: { passwordHash: hashedPassword }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Internal server error during password reset' }, { status: 500 });
    }
}
