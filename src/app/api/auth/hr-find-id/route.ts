import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: '이름과 연락처를 모두 입력해주세요.' }, { status: 400 });
        }

        // Find user by name and phone
        // In real life, exact string match might fail if formats differ (e.g. 010-1234-5678 vs 01012345678).
        // For MVP, we do exact match.
        const users = await prisma.user.findMany({
            where: {
                name: name,
                status: { notIn: ['RESIGNED', '퇴사'] } // Do not allow resigned users to find ID
            }
        });

        if (users.length === 0) {
            return NextResponse.json({ error: '입력하신 이름과 일치하는 재직 중인 사원이 없습니다.' }, { status: 404 });
        }

        // Find a user that either matches the phone, or has no phone registered yet (for MVP)
        const user = users.find(u => !u.phone || u.phone === phone);

        if (!user) {
            return NextResponse.json({ error: '입력하신 연락처가 등록된 정보와 일치하지 않습니다.' }, { status: 401 });
        }

        // Return the employee number
        return NextResponse.json({ 
            success: true, 
            employeeNumber: user.employeeNumber 
        });

    } catch (error) {
        console.error('Find ID Error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
