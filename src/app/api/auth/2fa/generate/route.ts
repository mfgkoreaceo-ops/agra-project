import { NextResponse } from 'next/server';
import { generate2FAForUser } from './utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employeeNumber } = body;

        if (!employeeNumber) {
            return NextResponse.json({ error: 'Employee number required' }, { status: 400 });
        }

        const { secret, qrCodeUrl } = await generate2FAForUser(employeeNumber);
        return NextResponse.json({ secret, qrCodeUrl });
    } catch (error) {
        console.error('2FA Generate Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
