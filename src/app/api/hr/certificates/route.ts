import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeId, type, purpose } = body;

        if (!employeeId || !purpose) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        const newRecord = await prisma.certificateRecord.create({
            data: {
                employeeId,
                type: type || 'CERTIFICATE_OF_EMPLOYMENT',
                purpose
            }
        });

        return NextResponse.json({ success: true, certificate: newRecord }, { status: 201 });
    } catch (error) {
        console.error('Failed to create certificate record:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const history = await prisma.certificateRecord.findMany({
            include: {
                employee: {
                    select: {
                        name: true,
                        brand: true,
                        department: true,
                        employeeNumber: true
                    }
                }
            },
            orderBy: {
                issuedAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, records: history });
    } catch (error) {
        console.error('Failed to fetch certificate records:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
