import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeNumber = searchParams.get('employeeNumber');
        
        if (!employeeNumber) {
            return NextResponse.json({ error: 'Missing employeeNumber' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeNumber },
            select: {
                employeeNumber: true,
                name: true,
                brand: true,
                storeName: true,
                department: true,
                role: true,
                phone: true,
                joinedAt: true,
                is2faEnabled: true,
                address: true,
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return NextResponse.json({ error: 'Internal server error while fetching profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber, name, role, storeName, phone, address } = body;

        if (!employeeNumber) {
            return NextResponse.json({ error: 'Missing employeeNumber' }, { status: 400 });
        }

        // Only update fields that exist in the Prisma User schema
        const updatedUser = await prisma.user.update({
            where: { employeeNumber: employeeNumber },
            data: {
                name: name !== undefined ? name : undefined,
                role: role !== undefined ? role : undefined,
                storeName: storeName !== undefined ? storeName : undefined,
                phone: phone !== undefined ? phone : undefined,
                address: address !== undefined ? address : undefined,
            },
        });

        // We do not return the full user record (like passwords), just a success status
        return NextResponse.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: {
                name: updatedUser.name,
                role: updatedUser.role,
                storeName: updatedUser.storeName,
                phone: updatedUser.phone,
                address: updatedUser.address
            }
        });
    } catch (error) {
        console.error('Failed to update profile:', error);
        return NextResponse.json({ error: 'Internal server error while updating profile' }, { status: 500 });
    }
}
