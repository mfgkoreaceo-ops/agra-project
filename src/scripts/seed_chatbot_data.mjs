import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chatbotDocs = [
    {
        title: "[운영/위생] APP 품질 위생 점검 및 관리 기준",
        content: `핵심 키워드: #위생점검, #식재료관리, #교차오염방지, #연간교육계획

공통 점검 항목 (행정/법규):
- 영업신고증 원본 및 식품위생교육 수료증 상시 비치 여부 확인.
- 자체 일일 위생 점검표 작성 및 방역 소독필증 보관 상태 확인.
- 건강검진(보건증) 유효기간 관리 및 원산지 게시판 게시 여부 점검.

식재료 및 보관 관리:
- 유통기한: 소비기한 경과 식재료 즉시 폐기 및 Shelf-life(제조/소분 라벨링) 준수.
- 선입선출: 밀봉 관리 및 냉장(5℃ 이하)/냉동(-18℃ 이하) 온도 준수.
- 해동: 냉장 해동 또는 유수 해동 실시 (실온 해동 금지).

조리 및 품질(Agra/Noya 공통):
- 탄두리 치킨: 매뉴얼 준수(중심온도 체크), 1차 조리 및 플레이팅 규격 확인.
- 식재 규격: 샐러드 야채(4~6cm), 커리용 청경채(3cm), 새송이(6*0.3cm), 양파(0.3cm).
- 기타: 라이스 정량 및 밥알 상태, 라씨 숙성도 및 음료 레시피 준수 여부.

26년도 연간 위생 교육 계획:
- 매월 테마별 교육 (예: 1월-표시사항, 7월-식중독 예방, 11월-식품 보관 등).
- 정기점검: 월 1회 아그라홀딩스 기준 점검 (A/B/C 등급 부여).`,
        category: "운영/위생"
    },
    {
        title: "[서비스] 아그라 서비스 매뉴얼 및 코스 가이드",
        content: `핵심 키워드: #코스메뉴, #서비스액션플랜, #리필정책, #프리버싱

코스별 구성 및 특징:
- 인디아 코스: 커리, 샐러드, 난, 라이스, 음료 (전 메뉴 고정, 리필 불가).
- 갠지스 코스: 포테이토 헤드 추가 (리필 불가).
- 프리미엄 세트: 커리 모든 메뉴 선택 가능, 난 무제한 리필, 음료(라씨/에이드) 리필 가능.

핵심 액션 플랜:
- Full Hand In/Out: 주방 출입 시 빈 접시를 들고 들어가고(In), 나올 때는 음식이나 음료를 반드시 지참(Out).
- 프리버싱(Pre-bushing): 커리 서브 전 샐러드 큰 접시 정리 필수. 특히 탄두리 치킨 서브 전 정리가 베스트.
- 선제적 서비스: 앞치마 제공, 태블릿 사용 지원, 접시 교체 및 리필 여부 먼저 묻기.

매장 운영 디테일:
- 대형 매장의 경우 무전을 통한 티켓 타임(음식 서빙 속도) 조절 필수.
- 환대 및 환송 시 밝은 미소와 한층 높은 톤 유지.`,
        category: "서비스 메뉴얼"
    },
    {
        title: "[협력사] 주요 수리업체 및 거래처 연락처",
        content: `매장 시설 수리 및 점검 협력업체 연락처:

- 냉장/냉동: 유니크대성 (1588-9269) / 주요품목: 4도어 냉동/냉장고 (대표번호)
- 냉장/냉동: 그랜드우성 (1588-1328) / 주요품목: 4도어 냉장고 (대표번호)
- 세척기: 누마스타 (1588-7008) / 주요품목: 식기세척기 (대표번호)
- 세척기: 유니크대성 (1588-2463) / 주요품목: 식기세척기 (대표번호)
- 쇼케이스: 진우전자 (031-357-9011) / 주요품목: 쇼케이스 냉장고 (C2 매장 등)
- 소독기: 삼미산업 (02-2688-3245) / 주요품목: 살균 소독기 (여의도점 등)
- 기타 용접: 청년불꽃용접 (010-8618-3408) / 주요품목: 용접/수리 (C2 매장)`,
        category: "협력사 및 거래처"
    }
];

async function run() {
    console.log("Seeding HR chatbot data...");
    let added = 0;
    for (const doc of chatbotDocs) {
        // Only insert if it doesn't already exist to prevent duplicates
        const exists = await prisma.knowledgeDocument.findFirst({
            where: { title: doc.title }
        });
        if (!exists) {
            await prisma.knowledgeDocument.create({
                data: doc
            });
            added++;
        }
    }
    console.log("Successfully added " + added + " new chatbot knowledge documents.");
}

run()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
