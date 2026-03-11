import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const documents = await prisma.knowledgeDocument.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(documents);
    } catch (error) {
        console.error('Failed to fetch knowledge docs:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, category } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const doc = await prisma.knowledgeDocument.create({
            data: {
                title,
                content,
                category,
            }
        });

        return NextResponse.json(doc);
    } catch (error) {
        console.error('Failed to create knowledge doc:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, content, category } = body;

        if (!id || !title || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const doc = await prisma.knowledgeDocument.update({
            where: { id },
            data: { title, content, category }
        });

        return NextResponse.json(doc);
    } catch (error) {
        console.error('Failed to update knowledge doc:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
