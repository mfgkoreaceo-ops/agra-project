import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Role Update Script...");

    // 1. 김대중: 전무/관리 본부장 (HEAD_OF_MANAGEMENT)
    await prisma.user.updateMany({
        where: { name: '김대중' },
        data: {
            role: 'HEAD_OF_MANAGEMENT',
            jobTitle: '전무/관리 본부장',
            department: '관리본부',
            canManageNotices: true,
            canManageLeaves: true,
            canManagePayroll: true
        }
    });
    console.log("Updated: 김대중 -> HEAD_OF_MANAGEMENT");

    // 2. 윤나라: 대표이사 (HR_ADMIN - highest access)
    // You mentioned "나(윤나라)와 동일한 권한" so we give her everything
    await prisma.user.updateMany({
        where: { name: '윤나라' },
        data: {
            role: 'HR_ADMIN',
            jobTitle: '대표이사',
            department: '임원실',
            canManageNotices: true,
            canManageLeaves: true,
            canManagePayroll: true
        }
    });
    console.log("Updated: 윤나라 -> HR_ADMIN (CEO)");

    // 3. 신선주: 임원실 비서실장 (HR_ADMIN - same as Yoon Nara)
    await prisma.user.updateMany({
        where: { name: '신선주' },
        data: {
            role: 'HR_ADMIN',
            jobTitle: '임원실 비서실장',
            department: '임원실',
            canManageNotices: true,
            canManageLeaves: true,
            canManagePayroll: true
        }
    });
    console.log("Updated: 신선주 -> HR_ADMIN");

    // 4. 장경연: 팀장, HR 모든 권한 (HR_ADMIN)
    await prisma.user.updateMany({
        where: { name: '장경연' },
        data: {
            role: 'HR_ADMIN',
            jobTitle: '팀장',
            department: '인사/기획팀',
            canManageNotices: true,
            canManageLeaves: true,
            canManagePayroll: true
        }
    });
    console.log("Updated: 장경연 -> HR_ADMIN");

    // 5. 장미희: 선임대리, HR 모든 권한 (HR_ADMIN)
    await prisma.user.updateMany({
        where: { name: '장미희' },
        data: {
            role: 'HR_ADMIN',
            jobTitle: '선임대리',
            department: '인사/기획팀',
            canManageNotices: true,
            canManageLeaves: true,
            canManagePayroll: true
        }
    });
    console.log("Updated: 장미희 -> HR_ADMIN");

    // 6. 권순석: 영업본부장, 영업본부에 관한 모든 권한 (HEAD_OF_SALES)
    await prisma.user.updateMany({
        where: { name: '권순석' },
        data: {
            role: 'HEAD_OF_SALES',
            jobTitle: '영업본부장',
            department: '영업본부',
            canManageNotices: true,
            canManageLeaves: true,
            canManagePayroll: false // Typically sales head manages leaves but not full payroll
        }
    });
    console.log("Updated: 권순석 -> HEAD_OF_SALES");

    // 7. Store GMs (Find any staff with "GM" or "점장" inside their role or job title and make them store managers)
    // We update everyone whose job role string in DB contains "GM" to "STORE_MANAGER"
    const gmUsers = await prisma.user.findMany({
        where: {
            OR: [
                { role: { contains: 'GM' } },
                { jobTitle: { contains: 'GM' } },
                { role: { contains: '점장' } },
                { jobTitle: { contains: '점장' } }
            ]
        }
    });

    console.log(`Found ${gmUsers.length} GMs. Updating roles to STORE_MANAGER...`);

    for (const gm of gmUsers) {
        await prisma.user.update({
            where: { id: gm.id },
            data: {
                role: 'STORE_MANAGER',
                canManageLeaves: true // Grant permission to manage store staff leaves
            }
        });
    }

    console.log("Role update script finished successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
