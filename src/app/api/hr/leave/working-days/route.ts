import { NextResponse } from 'next/server';
import Holidays from 'date-holidays';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startStr = searchParams.get('start');
        const endStr = searchParams.get('end');

        if (!startStr || !endStr) {
            return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
        }

        const startDate = new Date(startStr);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(endStr);
        endDate.setHours(0, 0, 0, 0);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
             return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
        }

        if (startDate > endDate) {
            return NextResponse.json({ workingDays: 0 });
        }

        const hd = new Holidays('KR');
        let workingDays = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            // Check if it's a public holiday
            const hols = hd.isHoliday(current);
            let isPublicHoliday = false;
            if (hols && hols.length > 0) {
                isPublicHoliday = hols.some((h: any) => h.type === 'public' || h.type === 'bank');
            }

            if (!isWeekend && !isPublicHoliday) {
                workingDays++;
            }

            current.setDate(current.getDate() + 1);
        }

        return NextResponse.json({ workingDays });

    } catch (error) {
        console.error('Failed to calculate working days:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
