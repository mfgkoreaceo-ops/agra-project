import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const regulations = [
    {
        title: "연차 15일 및 가산 연차 규정",
        content: "■ 기본 연차 (15일)\n1. 발생 기준: 입사일 기준 1년 만근 시 15일의 기본 연차가 발생합니다.\n2. 대상: 주 15시간 이상 근무하며, 1년간 80% 이상 출근한 근로자.\n\n■ 가산 연차 규정\n1. 발생 시점: 입사일 기준 3년 이상 계속 근로한 근로자.\n2. 가산 방식: 최초 1년을 초과하는 계속 근로 연수 매 2년에 대하여 1일씩 가산합니다.\n3. 최대 연차 일수: 기본 연차 15일과 가산 연차를 합하여 총 25일을 초과할 수 없습니다.\n4. 예시:\n   - 근속 1년 미만: 1개월 개근 시 1일 발생 (최대 11일)\n   - 근속 1년: 15일\n   - 근속 3년: 16일 (15일 + 1일)\n   - 근속 5년: 17일 (15일 + 2일)",
        category: "근태/연차"
    },
    {
        title: "연차휴가 사용 촉진 제도",
        content: "■ 연차휴가 사용 촉진 (근로기준법 제61조)\n회사는 근로자의 미사용 연차휴가가 소멸되기 6개월 전과 2개월 전에 적극적으로 연차 사용을 촉진합니다.\n\n1차 촉진 (소멸 6개월 전):\n- 회사는 근로자에게 미사용 연차 일수를 서면으로 통보하고, 사용 시기를 지정하여 통보해 줄 것을 요구합니다.\n- 근로자는 통보를 받은 날로부터 10일 이내에 사용 시기를 지정하여 회사에 제출해야 합니다.\n\n2차 촉진 (소멸 2개월 전):\n- 근로자가 1차 촉진에도 불구하고 사용 시기를 지정하지 않은 경우, 회사가 임의로 사용 시기를 지정하여 근로자에게 서면 통보합니다.",
        category: "근태/연차"
    },
    {
        title: "연차 미사용 수당 및 이월",
        content: "■ 미사용 연차휴가 수당 지급 원칙\n근로자가 퇴사하거나, 회사 측 사유 귀책으로 연차를 모두 소진하지 못한 경우, 미사용 연차에 대한 수당이 지급됩니다.\n(지급 기준: 미사용 일수 × 통상임금 1일분)\n\n단, 회사가 적법한 절차에 따라 '연차휴가 사용 촉진제도'를 실시하였음에도 근로자가 사용하지 않아 소멸된 경우, 미사용 연차 수당 지급 의무가 면제됩니다.\n\n■ 연차 이월\n원칙적으로 연차휴가는 발생일로부터 1년간 유효하며, 이월되지 않습니다.",
        category: "근태/연차"
    },
    {
        title: "반차 및 경조 휴가 규정",
        content: "■ 반차(0.5일) 사용 안내\n- 직원은 개인 사정에 따라 연차휴가를 0.5일(반차) 단위로 분할하여 사용할 수 있습니다.\n- 반차 사용 시 근로 시간은 오전/오후 각 4시간을 기준으로 합니다.\n\n■ 경조 휴가 (별도 유급 휴가)\n본인의 결혼, 직계존비속의 상 등 회사가 인정하는 경조사에 대해서는 연차와 별개로 경조 휴가를 부여합니다.\n- 본인 결혼: 5일\n- 배우자 출산: 10일\n- 직계존속상: 5일",
        category: "복리후생"
    }
];

async function seedKnowledgeBase() {
    console.log('Clearing old leave regulations...');
    await prisma.knowledgeDocument.deleteMany({
        where: { category: { in: ["근태/연차", "복리후생"] } }
    });

    console.log('Seeding new detailed leave regulations...');
    for (const doc of regulations) {
        await prisma.knowledgeDocument.create({ data: doc });
    }

    console.log('Seeding finished successfully.');
}

seedKnowledgeBase()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
