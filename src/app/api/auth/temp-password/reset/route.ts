import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, code, newPassword } = body;

        if (!employeeNumber || !code || !newPassword) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber }
        });

        if (!user) {
            return NextResponse.json({ error: '유효하지 않은 계정입니다.' }, { status: 404 });
        }

        // Validate the 6-digit code
        if (!user.magicLinkToken || user.magicLinkToken !== code) {
            return NextResponse.json({ error: '인증번호가 일치하지 않습니다.' }, { status: 400 });
        }

        // Check Expiry
        if (!user.magicLinkExpires || user.magicLinkExpires < new Date()) {
            return NextResponse.json({ error: '인증번호의 유효 시간(15분)이 만료되었습니다. 다시 요청해 주세요.' }, { status: 400 });
        }

        // Password complexity check
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json({ 
                error: '비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 최소 8자리 이상이어야 합니다.' 
            }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password & clear explicit token fields
        await prisma.user.update({
            where: { employeeNumber },
            data: { 
                passwordHash: hashedPassword,
                magicLinkToken: null,
                magicLinkExpires: null
            }
        });

        // Return user payload directly (auto-login like Magic Link verification)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                employeeNumber: user.employeeNumber,
                name: user.name,
                role: user.role,
                brand: user.brand,
                storeName: user.storeName,
                department: user.department,
                jobTitle: user.jobTitle,
                canManageLeaves: user.canManageLeaves,
                canManageResignations: user.canManageResignations,
                canManageCertificates: user.canManageCertificates,
                canManageStores: user.canManageStores,
                canManageHrInfo: user.canManageHrInfo,
                canManageIncidents: user.canManageIncidents,
                canManageKnowledge: user.canManageKnowledge,
                canManageEmployees: user.canManageEmployees,
                canManageLeavePolicy: user.canManageLeavePolicy,
                canManageNotices: user.canManageNotices
            }
        });

    } catch (error) {
        console.error('Password Reset Error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
