import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { employeeNumber, name, phone, password } = await req.json();

        if (!employeeNumber || !name || !phone || !password) {
            return NextResponse.json({ error: "모든 정보를 입력해야 합니다." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber }
        });

        if (!user) {
            return NextResponse.json({ error: "입력된 정보와 일치하는 사용자를 찾을 수 없거나 비밀번호가 틀립니다." }, { status: 404 });
        }

        if (user.status === 'RESIGNED' || user.status === '퇴사') {
            return NextResponse.json({ error: "퇴사 처리된 계정입니다." }, { status: 403 });
        }

        // Verify Name and Phone (allowing hyphens mismatch)
        if (user.name !== name) {
            return NextResponse.json({ error: "입력하신 이름이 등록된 정보와 일치하지 않습니다." }, { status: 401 });
        }

        if (user.phone) {
            const dbPhone = user.phone.replace(/[^0-9]/g, '');
            const inputPhone = phone.replace(/[^0-9]/g, '');
            if (dbPhone !== inputPhone) {
                return NextResponse.json({ error: "입력하신 연락처가 등록된 정보와 일치하지 않습니다." }, { status: 401 });
            }
        }

        // Verify Password
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        } catch {
            isPasswordValid = password === user.passwordHash;
        }

        if (!isPasswordValid && password !== user.passwordHash) {
            return NextResponse.json({ error: "입력된 정보와 일치하는 사용자를 찾을 수 없거나 비밀번호가 틀립니다." }, { status: 401 });
        }

        if (!user.is2faEnabled) {
            return NextResponse.json({ error: "2단계 인증이 활성화되어 있지 않은 계정입니다." }, { status: 400 });
        }

        // 초기화
        await prisma.user.update({
            where: { id: user.id },
            data: {
                is2faEnabled: false,
                twoFactorSecret: null
            }
        });

        return NextResponse.json({ success: true, message: "2단계 인증이 초기화되었습니다." });
    } catch (error) {
        console.error("2FA Reset API Error:", error);
        return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
    }
}
