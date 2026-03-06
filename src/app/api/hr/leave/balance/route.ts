import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function calculateAnnualLeave(joinedAt: Date, targetYear: number): number {
    const joinYear = joinedAt.getFullYear();
    const joinMonth = joinedAt.getMonth();
    const joinDate = joinedAt.getDate();

    if (joinYear === targetYear) {
        // Rule 1: 1년 미만자 (입사년도와 조회년도가 같을 때) -> 1개월 만근시 1개 발생.
        // 현재 기준으로 몇 달을 만근했는지 계산 (최대 11개)
        const now = new Date();
        const calcUntilDate = (now.getFullYear() > targetYear) ? new Date(targetYear, 11, 31) : now;
        let monthsWorked = calcUntilDate.getMonth() - joinMonth;
        if (calcUntilDate.getDate() < joinDate) monthsWorked--; 
        return Math.max(0, Math.min(11, monthsWorked));
    } else if (joinYear === targetYear - 1) {
        // Rule 2-1: 전년도 입사자 -> 입사일~12월 31일까지의 기간 / 365 * 15 (소수점 0.5 단위 올림)
        const endOfLastYear = new Date(joinYear, 11, 31);
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysWorked = Math.floor((endOfLastYear.getTime() - joinedAt.getTime()) / msPerDay) + 1;
        const calculated = (daysWorked / 365) * 15;
        // 0.5 단위로 올림 (예: 7.52 -> 7.5 로 표시하는 것이 맞다고 하셨지만, 
        // 수학적으로 0.5 단위 올림은 Math.ceil(val * 2) / 2 입니다.
        // 하지만 유저 예시 183 -> 7.5 였으므로 소수 첫째자리 반올림이나 round에 가깝습니다.
        // 안전하게 Math.round 처리(Nearest 0.5)합니다. 183/365*15 = 7.52 => 7.5
        return Math.round(calculated * 2) / 2;
    } else {
        // Rule 2-2: 전년도 1월 1일 이전 입사자 -> 15개 + 1월 1일 기준 재직년수 2년에 1개 가산
        const tenureYears = targetYear - joinYear;
        // 2년부터 매 2년마다 1개발생 (1년차는 위에서 2-1로 처리됨)
        // 2년차: 15, 3년차: 16 (Wait, 1월1일 기준 재직년수 2년에 1개? 
        // 2년 만근시 15일, 3년만근시 16일, 5년만근시 17일 이런 식의 근로기준법.
        // tenureYears = targetYear - joinYear. 
        // ex: 2020년 입사, 2026년 타겟 -> tenureYears = 6. 
        // 법정연차 가산은 (재직연수 - 1) / 2 를 내림. 
        // 6년차면 (6-1)/2 = 2.5 -> 2개 가산 -> 17개. 
        // "1월 1일 기준 재직년수 2년에 1개 가산" => Math.floor(tenureYears / 2)?
        // 2024년 입사 -> 2026 타겟 (tenure 2년). 15 + 2/2 = 16? 
        // 보통 2년차 넘어가면, 홀수년차에 1일씩 늘어납니다. (3년차 16, 5년차 17)
        // 근로기준법상: Math.floor((tenureYears - 1) / 2). 
        // 3년차면 (3-1)/2 = 1 => 16. 2년차면 (2-1)/2 = 0.5 => 15.
        const extraDays = Math.floor((tenureYears - 1) / 2);
        return 15 + Math.max(0, extraDays);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeNumber = searchParams.get('employeeNumber');

        if (!employeeNumber) {
            return NextResponse.json({ error: 'Missing employeeNumber' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { employeeNumber } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentYear = new Date().getFullYear();
        let leave = await prisma.leave.findFirst({
            where: { employeeId: user.id, year: currentYear }
        });

        if (!leave) {
            const calculatedTotalDays = calculateAnnualLeave(new Date(user.joinedAt), currentYear);
            leave = await prisma.leave.create({
                data: {
                    employeeId: user.id,
                    year: currentYear,
                    totalDays: calculatedTotalDays,
                    usedDays: 0
                }
            });
        }

        return NextResponse.json(leave);
    } catch (error) {
        console.error('Failed to fetch leave balance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
