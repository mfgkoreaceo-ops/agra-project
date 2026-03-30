import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationCodeEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, name, birthDate } = body;

        if (!employeeNumber || !name || !birthDate) {
            return NextResponse.json({ error: '모든 정보를 입력해 주세요.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber }
        });

        // Error out with generic message if mismatch (including null birthDate checks)
        if (!user || user.name !== name || !user.birthDate) {
            return NextResponse.json({ error: '일치하는 직원 정보를 찾을 수 없습니다. (생년월일 미등록 계정의 경우 인사팀에 문의하세요)' }, { status: 404 });
        }

        // Resilient parsing to handle `M/D/YY` or `MM/DD/YYYY` from Excel uploads
        let normalizedDbBirth = user.birthDate.replace(/[-.\/]/g, '').trim();
        if (user.birthDate.includes('/')) {
            const p = user.birthDate.split('/');
            if (p.length === 3) {
                let y = p[2];
                let m = p[0].padStart(2, '0');
                let d = p[1].padStart(2, '0');
                if (y.length === 2) y = (parseInt(y) > 25 ? '19' : '20') + y;
                normalizedDbBirth = y + m + d;
            }
        }

        const normalizedInputBirth = birthDate.replace(/[-.\/]/g, '').trim();

        if (normalizedDbBirth !== normalizedInputBirth) {
            return NextResponse.json({ error: '일치하는 직원 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!user.email) {
            return NextResponse.json({ error: '해당 계정에 등록된 이메일 주소가 없습니다. 인사팀에 문의하세요.' }, { status: 400 });
        }

        // Generate exactly 6 digits
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Overwrite magicLink token fields for this 6-digit code
        await prisma.user.update({
            where: { employeeNumber },
            data: {
                magicLinkToken: code,
                magicLinkExpires: expires
            }
        });

        const emailSent = await sendVerificationCodeEmail(user.email, code, user.name);

        if (!emailSent) {
            return NextResponse.json({ error: '인증번호 이메일 발송에 실패했습니다. 시스템 관리자에게 문의하세요.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '안전하게 인증번호가 발송되었습니다.' });

    } catch (error) {
        console.error('Temp Password Request Error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
