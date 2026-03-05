import { NextResponse } from 'next/server';
import { authenticator } from '@otplib/preset-default';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';

export async function generate2FAForUser(employeeNumber: string) {
    const user = await prisma.user.findUnique({ where: { employeeNumber } });
    if (!user) throw new Error('User not found');

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(employeeNumber, 'AGRA_NOYA_HRMS', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    await prisma.user.update({
        where: { employeeNumber },
        data: { twoFactorSecret: secret }
    });

    return { secret, qrCodeUrl };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber } = body;

        if (!employeeNumber) {
            return NextResponse.json({ error: 'Employee number required' }, { status: 400 });
        }

        const { secret, qrCodeUrl } = await generate2FAForUser(employeeNumber);
        return NextResponse.json({ secret, qrCodeUrl });
    } catch (error) {
        console.error('2FA Generate Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
