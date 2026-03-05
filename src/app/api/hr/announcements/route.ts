import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const notices = await prisma.notice.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20, // get latest 20
        });
        return NextResponse.json({ success: true, notices });
    } catch (error) {
        console.error('Failed to fetch notices:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, isImportant, author } = body;

        if (!title || !content) {
            return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 });
        }

        const newNotice = await prisma.notice.create({
            data: {
                title,
                content,
                isImportant: !!isImportant,
                author: author || '인사팀'
            }
        });

        return NextResponse.json({ success: true, notice: newNotice });
    } catch (error) {
        console.error('Failed to create notice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
