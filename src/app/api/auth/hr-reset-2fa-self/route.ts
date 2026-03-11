import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "data", "users.json");

export async function POST(req: Request) {
    try {
        const { employeeNumber, name, phone, password } = await req.json();

        if (!employeeNumber || !name || !phone || !password) {
            return NextResponse.json({ error: "모든 정보를 입력해야 합니다." }, { status: 400 });
        }

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "사용자 데이터베이스가 없습니다." }, { status: 500 });
        }

        const rawData = fs.readFileSync(usersFilePath, "utf-8");
        const data = JSON.parse(rawData);
        const users = data.users || [];

        const userIndex = users.findIndex(
            (u: any) =>
                u.employeeNumber === employeeNumber &&
                u.name === name &&
                u.phone === phone &&
                u.password === password
        );

        if (userIndex === -1) {
            return NextResponse.json({ error: "입력된 정보와 일치하는 사용자를 찾을 수 없거나 비밀번호가 틀립니다." }, { status: 404 });
        }

        const user = users[userIndex];

        if (!user.is2faEnabled) {
            return NextResponse.json({ error: "2단계 인증이 활성화되어 있지 않은 계정입니다." }, { status: 400 });
        }

        // 초기화
        user.is2faEnabled = false;
        user.twoFactorSecret = null;
        users[userIndex] = user;

        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true, message: "2단계 인증이 초기화되었습니다." });
    } catch (error) {
        console.error("2FA Reset API Error:", error);
        return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
    }
}
