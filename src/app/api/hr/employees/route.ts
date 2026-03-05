import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requesterId = searchParams.get('requesterId');

        if (!requesterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const requester = await prisma.user.findUnique({ where: { employeeNumber: requesterId } });
        if (!requester) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let whereClause = {};

        // Define visibility rules based on Role
        if (requester.role === 'STORE_MANAGER') {
            whereClause = { storeName: requester.storeName };
        } else if (['SALES_TEAM_LEADER', 'HEAD_OF_SALES', 'HR_ADMIN', 'HEAD_OF_MANAGEMENT'].includes(requester.role)) {
            // Can see all employees
            whereClause = {};
        } else if (requester.role === 'HQ_TEAM_LEADER' || requester.role === 'HQ_STAFF') {
            // Assuming HQ staff can see everyone, or at least HQ. The user said: "본사팀에서는 전체 임직원을 볼 수 있게 해 줘"
            whereClause = {};
        } else {
            // Normal STAFF only sees themselves
            whereClause = { id: requester.id };
        }

        const employees = await prisma.user.findMany({
            where: whereClause,
            orderBy: { joinedAt: 'desc' },
            select: {
                id: true,
                employeeNumber: true,
                name: true,
                brand: true,
                storeName: true,
                department: true,
                role: true,
                employmentType: true,
                status: true,
                phone: true,
                joinedAt: true,
                is2faEnabled: true,
            }
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employees } = body;

        if (!Array.isArray(employees) || employees.length === 0) {
            return NextResponse.json({ error: 'No employee data provided' }, { status: 400 });
        }

        // Hash a default password for all newly uploaded users ("1234")
        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('1234', salt);

        let successCount = 0;
        let errors = [];

        for (const emp of employees) {
            try {
                await prisma.user.upsert({
                    where: { employeeNumber: emp.employeeNumber },
                    update: {
                        name: emp.name,
                        brand: emp.brand,
                        storeId: emp.storeId || 'unknown',
                        storeName: emp.storeName,
                        department: emp.department,
                        role: emp.role || 'STAFF',
                        employmentType: emp.employmentType || 'Full-Time',
                        status: emp.status || 'Active',
                        phone: emp.phone || null,
                        email: emp.email || null,
                    },
                    create: {
                        employeeNumber: emp.employeeNumber,
                        name: emp.name,
                        brand: emp.brand,
                        storeId: emp.storeId || 'unknown',
                        storeName: emp.storeName,
                        department: emp.department,
                        role: emp.role || 'STAFF',
                        employmentType: emp.employmentType || 'Full-Time',
                        status: emp.status || 'Active',
                        phone: emp.phone || null,
                        email: emp.email || null,
                        joinedAt: emp.joinedAt ? new Date(emp.joinedAt) : new Date(),
                        passwordHash: defaultPasswordHash,
                    }
                });
                successCount++;
            } catch (err: any) {
                errors.push(`Failed to import ${emp.employeeNumber || 'Unknown'}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json({ error: 'Internal server error during bulk upload' }, { status: 500 });
    }
}
