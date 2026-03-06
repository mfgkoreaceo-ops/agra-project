import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const prisma = new PrismaClient();

// Excel columns map from earlier inspection:
// '부서명', '사번', '직원명', '인사구분', '직급', '입사일', '퇴사일', '시급', '기본급', ...

function excelDateToJSDate(serial) {
    // Check if it's already a JS Date string
    if (typeof serial === "string") {
        const parsed = new Date(serial);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    // Handle Excel serial date
    if (typeof serial === "number") {
        const utc_days  = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;                                        
        const date_info = new Date(utc_value * 1000);
        return date_info;
    }
    return new Date(); // fallback
}

async function run() {
    console.log("Starting data migration from Excel...");

    try {
        // 1. Wipe old data
        console.log("Wiping existing dummy data...");
        await prisma.leaveRequest.deleteMany({});
        await prisma.leave.deleteMany({});
        await prisma.payroll.deleteMany({});
        await prisma.certificateRecord.deleteMany({});
        await prisma.user.deleteMany({});
        console.log("Successfully wiped previous data.");

        // 2. Read Excel
        const filePath = 'C:\\Users\\nyoon\\OneDrive\\문서\\카카오톡 받은 파일\\미식 인사목록(26.03.04).xlsx';
        const buf = fs.readFileSync(filePath);
        const workbook = XLSX.read(buf, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        let failCount = 0;

        // 3. Insert real data
        for (const row of data) {
            try {
                // Ensure employee number exists
                const employeeNumberStr = row["사번"] ? String(row["사번"]).trim() : null;
                if (!employeeNumberStr) continue;

                // Hash password => using employeeNumber
                const passwordHash = await bcrypt.hash(employeeNumberStr, 10);

                const name = row["직원명"] ? String(row["직원명"]).trim() : "알수없음";
                const department = row["부서명"] ? String(row["부서명"]).trim() : "운영팀";
                const jobTitle = row["직급"] ? String(row["직급"]).trim() : "";
                const employmentType = row["인사구분"] ? String(row["인사구분"]).trim() : "정규직";
                
                const joinedAt = row["입사일"] ? excelDateToJSDate(row["입사일"]) : new Date();
                const status = row["퇴사일"] && String(row["퇴사일"]).trim() !== "" ? "RESIGNED" : "ACTIVE";

                const baseSalary = Number(row["기본급"]) || 0;
                const hourlyWage = Number(row["시급"]) || 0;
                
                const residentNumber = row["주민번호"] ? String(row["주민번호"]).trim() : null;
                const bankName = row["급여은행"] ? String(row["급여은행"]).trim() : null;
                const accountNumber = row["급여계좌"] ? String(row["급여계좌"]).trim() : null;
                const phone = row["연락처"] ? String(row["연락처"]).trim() : null;
                const address = row["도로명주소"] ? String(row["도로명주소"]).trim() : null;

                let role = "STAFF";
                if (jobTitle.includes("전무") || jobTitle.includes("대표") || jobTitle.includes("본부장")) {
                    role = "HR_ADMIN"; 
                } else if (jobTitle.includes("점장") || jobTitle.includes("매니저")) {
                    role = "MANAGER";
                }

                await prisma.user.create({
                    data: {
                        employeeNumber: employeeNumberStr,
                        name,
                        department,
                        jobTitle,
                        employmentType,
                        status,
                        joinedAt,
                        baseSalary,
                        hourlyWage,
                        residentNumber,
                        bankName,
                        accountNumber,
                        phone,
                        address,
                        brand: "HQ", // Default
                        storeId: "hq",
                        storeName: "본사",
                        role,
                        passwordHash,
                        canManageLeaves: role === "HR_ADMIN",
                        canManageNotices: role === "HR_ADMIN",
                        canManagePayroll: role === "HR_ADMIN"
                    }
                });
                successCount++;
            } catch (err) {
                console.error("Failed importing row:", row, err);
                failCount++;
            }
        }

        console.log(`Migration completed! Successfully imported ${successCount} employees. Errors: ${failCount}`);
    } catch (e) {
        console.error("Critical failure during migration:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
