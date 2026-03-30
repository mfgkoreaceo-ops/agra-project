import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, name, password } = body;

        // Require 3 elements
        if (!employeeNumber || !name || !password) {
            return NextResponse.json({ error: '입력하신 정보가 올바르지 않습니다.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber }
        });

        // 1. Check if user exists and NAME matches (Generic error for security)
        if (!user || user.name !== name) {
            return NextResponse.json({ error: '입력하신 정보가 올바르지 않습니다.' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Block Resigned Employees (and auto-update if passed resignation date)
        if (user.status === 'RESIGNED' || user.status === '퇴사' || (user.resignedAt && new Date(user.resignedAt) < today)) {
            if (user.status !== 'RESIGNED' && user.status !== '퇴사') {
                await prisma.user.update({ where: { id: user.id }, data: { status: 'RESIGNED' } });
            }
            return NextResponse.json({ error: '퇴사 처리된 계정입니다. 접근이 제한되었습니다.' }, { status: 403 });
        }

        // 3. Verify Password using bcrypt
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        } catch {
            // Fallback for plaintext passwords from raw seeding if any
            isPasswordValid = password === user.passwordHash;
        }

        if (!isPasswordValid) {
            return NextResponse.json({ error: '입력하신 정보가 올바르지 않습니다.' }, { status: 401 });
        }

        // 4. Force 1234 users into the password reset flow
        if (password === '1234') {
            // Test accounts '김인사' or Master accounts bypass this rule for convenience if we wanted
            // BUT user said "all", so we strictly adhere. We can let '장경연' or '대표이사' bypass if ever needed,
            // but for now, ALL '1234' is blocked.
            return NextResponse.json({ 
                error: "초기 임시 비밀번호(1234)로는 로그인할 수 없습니다. 화면 하단의 [최초 사이트 로그인]을 통해 안전한 비밀번호로 재설정해 주세요." 
            }, { status: 403 });
        }

        // Evaluate new corporate roles
        const isSuperAdminForPermissions = (
            user.name === '신선주' ||
            user.name === '장경연' ||
            user.name === '장미희' ||
            user.jobTitle?.includes('대표이사') ||
            user.jobTitle?.includes('최고경영자')
        );

        const isFullSuperAdmin = isSuperAdminForPermissions || (
            user.jobTitle?.includes('전무') ||
            user.jobTitle?.includes('본부장')
        );

        const mappedUser = {
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
            canManageNotices: user.canManageNotices,
            canManagePermissions: false
        };

        if (isFullSuperAdmin) {
            mappedUser.canManageLeaves = true;
            mappedUser.canManageResignations = true;
            mappedUser.canManageCertificates = true;
            mappedUser.canManageStores = true;
            mappedUser.canManageHrInfo = true;
            mappedUser.canManageIncidents = true;
            mappedUser.canManageKnowledge = true;
            mappedUser.canManageEmployees = true;
            mappedUser.canManageLeavePolicy = true;
            mappedUser.canManageNotices = true;
            mappedUser.canManagePermissions = isSuperAdminForPermissions;
        }

        // 5. Return user payload directly (Success)
        return NextResponse.json({
            success: true,
            user: mappedUser
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
