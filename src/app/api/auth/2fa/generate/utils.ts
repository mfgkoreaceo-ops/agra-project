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
