import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Leave Policies...");

    const policies = [
        { type: "ANNUAL", name: "연차", description: "기본 발생 연차", defaultDays: 15, isPaid: true, isActive: true },
        { type: "CONGRATULATORY", name: "경조 휴가", description: "결혼, 장례 등 경조사 목적의 유급 휴가", defaultDays: 5, isPaid: true, isActive: true },
        { type: "UNPAID", name: "무급 휴가", description: "질병 또는 개인 사정으로 인한 무급 휴직", defaultDays: 0, isPaid: false, isActive: true },
    ];

    for (const policy of policies) {
        await prisma.leavePolicy.upsert({
            where: { type: policy.type },
            update: {
                name: policy.name,
                description: policy.description,
                defaultDays: policy.defaultDays,
                isPaid: policy.isPaid,
                isActive: policy.isActive
            },
            create: policy
        });
    }

    console.log("Leave Policies seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
