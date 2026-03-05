import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database with tiered roles and 10 stores...')

    // Clear existing data (optional, but good for clean tests)
    await prisma.leaveRequest.deleteMany({})
    await prisma.leave.deleteMany({})
    await prisma.payroll.deleteMany({})
    await prisma.knowledgeDocument.deleteMany({})
    await prisma.user.deleteMany({})

    const passwordHash = await bcrypt.hash('Agra1234!', 10)

    // 1. HR ADMIN (Super Admin)
    await prisma.user.create({
        data: {
            employeeNumber: '20240001',
            name: '김인사',
            brand: 'HQ',
            storeId: 'HQ-HR',
            storeName: '본사',
            department: '인사팀',
            role: 'HR_ADMIN',
            employmentType: 'FULL_TIME',
            status: 'ACTIVE',
            passwordHash,
        }
    })

    // 2. Head of Management (관리 본부장)
    await prisma.user.create({
        data: {
            employeeNumber: '20260001',
            name: '이관리',
            brand: 'HQ',
            storeId: 'HQ-MGMT',
            storeName: '본사',
            department: '관리본부',
            role: 'HEAD_OF_MANAGEMENT',
            employmentType: 'FULL_TIME',
            status: 'ACTIVE',
            passwordHash,
        }
    })

    // 3. Head of Sales (영업 본부장)
    await prisma.user.create({
        data: {
            employeeNumber: '20260002',
            name: '박본부',
            brand: 'HQ',
            storeId: 'HQ-SALES',
            storeName: '본사',
            department: '영업본부',
            role: 'HEAD_OF_SALES',
            employmentType: 'FULL_TIME',
            status: 'ACTIVE',
            passwordHash,
        }
    })

    // 4. Sales Team Leader (영업 팀장)
    const salesTeamLeader = await prisma.user.create({
        data: {
            employeeNumber: '20260003',
            name: '최팀장',
            brand: 'HQ',
            storeId: 'HQ-SALES-1',
            storeName: '본사',
            department: '영업1팀',
            role: 'SALES_TEAM_LEADER',
            employmentType: 'FULL_TIME',
            status: 'ACTIVE',
            passwordHash,
        }
    })

    // 5. Generate 10 Stores
    const storeNames = [
        '아그라 이태원점', '아그라 강남점', '아그라 코엑스점', '아그라 여의도점', '아그라 잠실점',
        '노야 신사점', '노야 홍대점', '노야 판교점', '노야 수원점', '노야 부산점'
    ];

    let employeeCounter = 100;

    for (let i = 0; i < storeNames.length; i++) {
        const storeName = storeNames[i];
        const isAgra = storeName.includes('아그라');
        const prefix = isAgra ? 'AG' : 'NY';
        const brand = isAgra ? 'AGRA' : 'NOYA';

        // Create Store Manager
        const managerId = `2026${employeeCounter++}`;
        const manager = await prisma.user.create({
            data: {
                employeeNumber: managerId,
                name: `${storeName.split(' ')[1].replace('점', '')}점장`, // e.g., 이태원점장
                brand,
                storeId: `STORE-${i + 1}`,
                storeName,
                department: '매장관리',
                role: 'STORE_MANAGER',
                employmentType: 'FULL_TIME',
                status: 'ACTIVE',
                passwordHash,
            }
        });

        // Create 2 Staff for this store
        for (let j = 1; j <= 2; j++) {
            const staffId = `2026${employeeCounter++}`;
            const staff = await prisma.user.create({
                data: {
                    employeeNumber: staffId,
                    name: `${storeName.split(' ')[1].replace('점', '')}직원${j}`, // e.g., 이태원직원1
                    brand,
                    storeId: `STORE-${i + 1}`,
                    storeName,
                    department: j === 1 ? '홀서비스' : '주방',
                    role: 'STAFF',
                    employmentType: 'PART_TIME',
                    status: 'ACTIVE',
                    passwordHash,
                }
            });

            // Create a pending leave request from the staff to the manager
            await prisma.leaveRequest.create({
                data: {
                    employeeId: staff.id,
                    startDate: new Date('2026-03-10'),
                    endDate: new Date('2026-03-11'),
                    daysRequested: 2,
                    reason: '개인 사정으로 인한 연차 신청',
                    status: 'PENDING'
                }
            });
        }

        // Create a pending leave request from the manager to the Sales Team Leader
        if (i < 3) {
            await prisma.leaveRequest.create({
                data: {
                    employeeId: manager.id,
                    startDate: new Date('2026-04-01'),
                    endDate: new Date('2026-04-03'),
                    daysRequested: 3,
                    reason: '건강 검진 및 휴식',
                    status: 'PENDING'
                }
            });
        }
    }

    console.log('Database seeding complete: 10 Stores, 30 Store Employees, HQ Reporting lines created.');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
