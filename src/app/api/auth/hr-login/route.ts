import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generate2FAForUser } from '../2fa/generate/route';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, password } = body;

        if (!employeeNumber || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid employee number or password' }, { status: 401 });
        }

        // 1. Block Resigned Employees
        if (user.status === 'RESIGNED' || user.status === '퇴사') {
            return NextResponse.json({ error: '퇴사 처리된 계정입니다. 접근이 제한되었습니다.' }, { status: 403 });
        }

        // Verify Password
        // Check if the password is valid using bcrypt (we'll implement bcrypt hashing shortly for seeder)
        // For MVP, if it fails bcrypt, fallback to plaintext check just in case.
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        } catch {
            isPasswordValid = password === user.passwordHash;
        }

        if (!isPasswordValid && password !== user.passwordHash) {
            return NextResponse.json({ error: 'Invalid employee number or password' }, { status: 401 });
        }

        // 2. Prevent login if password is the default "1234"
        const isDefaultPassword = await bcrypt.compare('1234', user.passwordHash) || user.passwordHash === '1234';
        if (isDefaultPassword && password === '1234') {
            return NextResponse.json({ error: '초기 비밀번호 상태입니다. [최초 로그인 / 비밀번호 설정]을 진행해주세요.' }, { status: 403 });
        }

        if (!user.is2faEnabled || !user.twoFactorSecret) {
            // User needs to set up 2FA
            const genData = await generate2FAForUser(employeeNumber);

            return NextResponse.json({
                requiresSetup: true,
                qrCodeUrl: genData.qrCodeUrl,
                secret: genData.secret
            });
        }

        // User has 2FA enabled, tell frontend to prompt for OTP token
        return NextResponse.json({
            requiresSetup: false,
            message: 'OTP required'
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
