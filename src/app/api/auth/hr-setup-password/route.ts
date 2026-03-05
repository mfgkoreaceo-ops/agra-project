import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, name, phone, newPassword } = body;

        if (!employeeNumber || !name || !newPassword) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        // Password complexity check
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json({ 
                error: '비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 최소 8자리 이상이어야 합니다.' 
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber }
        });

        if (!user) {
            return NextResponse.json({ error: '일치하는 사원 정보가 없습니다.' }, { status: 404 });
        }

        if (user.status === 'RESIGNED' || user.status === '퇴사') {
            return NextResponse.json({ error: '퇴사 처리된 계정입니다.' }, { status: 403 });
        }

        // Check if password has already been changed from default
        const isDefaultPassword = await bcrypt.compare('1234', user.passwordHash) || user.passwordHash === '1234';
        if (!isDefaultPassword) {
            return NextResponse.json({ 
                error: '이미 비밀번호가 설정된 계정입니다. 비밀번호를 분실하신 경우 사내 인사팀(HR) 관리자에게 초기화를 요청하세요.' 
            }, { status: 403 });
        }

        // Verify Name and Phone
        // If phone in DB is null, we might just verify name, but to be secure, phone must match if it exists.
        if (user.name !== name) {
            return NextResponse.json({ error: '입력하신 이름이 등록된 정보와 일치하지 않습니다.' }, { status: 401 });
        }

        if (user.phone && user.phone !== phone) {
            return NextResponse.json({ error: '입력하신 연락처가 등록된 정보와 일치하지 않습니다.' }, { status: 401 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { employeeNumber },
            data: { passwordHash: hashedPassword }
        });

        return NextResponse.json({ success: true, message: '비밀번호가 성공적으로 설정되었습니다.' });

    } catch (error) {
        console.error('Setup Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
