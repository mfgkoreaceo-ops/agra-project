import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const policies = await prisma.leavePolicy.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json({ success: true, policies });
    } catch (error) {
        console.error('Failed to fetch leave policies:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description, defaultDays, isPaid, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing policy id' }, { status: 400 });
        }

        const updated = await prisma.leavePolicy.update({
            where: { id },
            data: {
                name,
                description,
                defaultDays: parseFloat(defaultDays),
                isPaid,
                isActive
            }
        });

        return NextResponse.json({ success: true, policy: updated });
    } catch (error) {
        console.error('Failed to update leave policy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, name, description, defaultDays, isPaid, isActive } = body;

        if (!type || !name) {
            return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
        }

        const created = await prisma.leavePolicy.create({
            data: {
                type,
                name,
                description,
                defaultDays: parseFloat(defaultDays || 0),
                isPaid: isPaid ?? true,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json({ success: true, policy: created }, { status: 201 });
    } catch (error) {
        console.error('Failed to create leave policy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
