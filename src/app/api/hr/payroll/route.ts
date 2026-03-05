import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requesterId = searchParams.get('requesterId');
        const view = searchParams.get('view');

        if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const requester = await prisma.user.findUnique({ where: { employeeNumber: requesterId } });
        if (!requester) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let whereClause = {};
        if (view === 'self') {
            whereClause = { employeeId: requester.id };
        } else if (requester.role !== 'HR_ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Only HR_ADMIN can view all payrolls.' }, { status: 403 });
        }

        const records = await prisma.payroll.findMany({
            where: whereClause,
            orderBy: { paymentMonth: 'desc' },
            include: {
                employee: {
                    select: { name: true, employeeNumber: true, storeName: true, department: true }
                }
            }
        });
        return NextResponse.json(records);
    } catch (error) {
        console.error('Failed to fetch payroll:', error);
        return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { records } = body;

        if (!Array.isArray(records) || records.length === 0) {
            return NextResponse.json({ error: 'No payroll data provided' }, { status: 400 });
        }

        let successCount = 0;
        let errors = [];

        for (const record of records) {
            try {
                // Find user by employeeNumber
                const user = await prisma.user.findUnique({
                    where: { employeeNumber: record.employeeNumber }
                });

                if (!user) {
                    errors.push(`User not found for ID: ${record.employeeNumber}`);
                    continue;
                }

                await prisma.payroll.create({
                    data: {
                        employeeId: user.id,
                        paymentMonth: record.month,
                        baseSalary: record.baseSalary || 0,
                        allowances: record.bonus || 0,
                        deductions: record.deductions || 0,
                        netPay: record.netPay || 0,
                        status: record.status || 'PAID'
                    }
                });
                successCount++;
            } catch (err: any) {
                errors.push(`Failed to import for ${record.employeeNumber}: ${err.message}`);
            }
        }

        return NextResponse.json({ success: true, count: successCount, errors });
    } catch (error) {
        console.error('Payroll upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
