import { NextResponse } from 'next/server';
import { authenticator } from '@otplib/preset-default';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, token } = body;

        if (!employeeNumber || !token) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { employeeNumber } });

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: '2FA not initialized for user' }, { status: 404 });
        }

        // Verify the token
        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret
        });

        if (isValid) {
            // If valid, mark 2FA as enabled permanently
            await prisma.user.update({
                where: { employeeNumber },
                data: { is2faEnabled: true }
            });
            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    employeeNumber: user.employeeNumber,
                    role: user.role,
                    brand: user.brand,
                    storeName: user.storeName,
                    department: user.department
                }
            });
        } else {
            return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
        }
    } catch (error) {
        console.error('2FA Verify Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
