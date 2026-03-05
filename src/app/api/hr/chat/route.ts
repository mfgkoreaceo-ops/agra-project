import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { message, employeeNumber } = await request.json();

        if (!message || !employeeNumber) {
            return NextResponse.json({ error: 'Missing message or employeeNumber' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { employeeNumber } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const q = message.toLowerCase();
        let responseText = "죄송합니다. 질문의 의도를 파악하지 못했습니다. 검색 키워드를 변경하시거나 지식 베이스를 확인해 주세요.";

        // 1. Personal DB Lookups
        if (q.includes("내 연차") || q.includes("내 남은") || q.includes("내 휴가")) {
            const currentYear = new Date().getFullYear();
            const leaveData = await prisma.leave.findFirst({
                where: { employeeId: user.id, year: currentYear }
            });

            if (leaveData) {
                const remaining = leaveData.totalDays - leaveData.usedDays;
                responseText = `${user.name}님의 올해 총 연차는 ${leaveData.totalDays}일이며, 현재 남은 연차는 **${remaining}일** 입니다.`;
            } else {
                responseText = `${user.name}님의 올해 연차 정보가 아직 등록되지 않았습니다.`;
            }
        }
        else if (q.includes("내 월급") || q.includes("내 급여") || q.includes("얼마")) {
            const payrollData = await prisma.payroll.findFirst({
                where: { employeeId: user.id },
                orderBy: { paymentMonth: 'desc' }
            });

            if (payrollData) {
                responseText = `보안 인증 확인: ${user.name}님의 가장 최근 급여(${payrollData.paymentMonth}) 실수령액은 **${payrollData.netPay.toLocaleString()}원** 입니다. 상세 내역은 급여 메뉴를 참조하세요.`;
            } else {
                responseText = `${user.name}님의 급여 기록이 존재하지 않습니다.`;
            }
        }
        // 2. High Security Blocks
        else if (q.includes("점장 연봉") || q.includes("다른 직원") || q.includes("매출")) {
            responseText = "⚠️ 보안 알림: 타인의 민감 정보 거나 영업 기밀 데이터는 챗봇으로 조회할 수 없습니다. (접근 거부됨)";
        }
        // 3. RAG Knowledge Search (Real DB Query)
        else {
            // Very rudimentary keyword search over knowledge documents
            const docs = await prisma.knowledgeDocument.findMany();

            // simple scoring based on keyword match
            let bestDoc = null;
            let bestScore = 0;

            // simple tokenizer for Korean/English
            const words = q.split(/\s+/);

            for (const doc of docs) {
                let score = 0;
                if (doc.title.toLowerCase().includes(q)) score += 5;
                if (doc.category.toLowerCase().includes(q)) score += 3;

                words.forEach((w: string) => {
                    if (w.length < 2) return;
                    if (doc.title.toLowerCase().includes(w)) score += 2;
                    if (doc.content.toLowerCase().includes(w)) score += 1;
                });

                if (score > bestScore) {
                    bestScore = score;
                    bestDoc = doc;
                }
            }

            if (bestDoc && bestScore >= 2) {
                responseText = `[사내 규정 DB 검색 결과: ${bestDoc.category} - ${bestDoc.title}]\n\n${bestDoc.content}`;
            }
        }

        return NextResponse.json({ response: responseText });

    } catch (error) {
        console.error('Chatbot API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
