export const HR_KNOWLEDGE_BASE = [
    {
        id: "leave_policy",
        keywords: ["연차", "휴가", "반차", "규정", "며칠"],
        content: "아그라 및 노야의 기본 연차 규정은 근로기준법을 따릅니다. 입사 1년 미만자는 1개월 만근 시 1일이 발생하며, 1년 이상 근무 시 15일 기본 연차가 부여됩니다. 반차는 0.5일로 계산됩니다."
    },
    {
        id: "family_event",
        keywords: ["경조사", "결혼", "합숙", "장례", "조사"],
        content: "경조사 휴가는 규정에 따라 본인 결혼 5일, 자녀 결혼 1일, 배우자 출산 10일이 부여됩니다. 조사의 경우 직계존비속 5일, 형제자매 1일이 부여됩니다. 자세한 사항은 점장에게 문의바랍니다."
    },
    {
        id: "salary_date",
        keywords: ["월급날", "월급", "급여일", "급여", "언제"],
        content: "아그라 및 노야 전 직원의 정기 급여일은 매월 10일입니다. 10일이 주말이나 공휴일인 경우, 직전 평일에 선지급됩니다."
    },
    {
        id: "uniform",
        keywords: ["유니폼", "복장", "옷", "세탁"],
        content: "홀 및 주방 근무자는 제공된 유니폼을 항시 착용해야 합니다. 최초 2벌이 무상 지급되며, 추가 구매나 훼손 시 본사 지원팀을 통해 신청할 수 있습니다."
    }
];

// Simple Intent Classifier
export function classifyIntent(query: string) {
    const q = query.toLowerCase();

    // 1. Personal DB Lookups (Requires RBAC/Auth)
    if (q.includes("내 연차") || q.includes("내 남은") || q.includes("내 휴가")) return "intent_my_leave";
    if (q.includes("내 월급") || q.includes("내 급여") || q.includes("얼마")) return "intent_my_salary";

    // 2. High Security Blocks
    if (q.includes("점장 연봉") || q.includes("다른 직원") || q.includes("매출")) return "intent_blocked";

    // 3. RAG Knowledge Search
    for (const kb of HR_KNOWLEDGE_BASE) {
        if (kb.keywords.some(kw => q.includes(kw))) {
            return { type: "intent_rag", content: kb.content };
        }
    }

    return "intent_unknown";
}
