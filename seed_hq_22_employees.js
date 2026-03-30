const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const rawData = [
  { empNo: "202508022", name: "강소희", birth: "1995-08-15", title: "대리", join: "2025-08-11", brand: "본사", team: "재무팀", email: "ksh@agra.co.kr", status: "재직", phone: "010-9514-5815" },
  { empNo: "202410023", name: "권순석", birth: "1980-12-06", title: "차장", join: "2024-10-21", brand: "본사", team: "영업팀", email: "kss@agra.co.kr", status: "재직", phone: "010-8764-3352" },
  { empNo: "202411001", name: "김대중", birth: "1979-08-06", title: "전무", join: "2024-11-01", brand: "본사", team: "관리본부", email: "jokeguy001@agra.co.kr", status: "재직", phone: "010-2787-0790" },
  { empNo: "202506032", name: "김조영", birth: "1997-05-29", title: "사원", join: "2025-06-23", brand: "본사", team: "QC팀", email: "whdud7461@agra.co.kr", status: "재직", phone: "010-9415-7461" },
  { empNo: "202505016", name: "박서진", birth: "2004-08-05", title: "사원", join: "2025-05-15", brand: "본사", team: "경영지원팀", email: "parksj@agra.co.kr", status: "재직", phone: "010-9942-9768" },
  { empNo: "202512001", name: "박수미", birth: "1997-03-07", title: "선임주임", join: "2025-12-01", brand: "본사", team: "영업팀", email: "tnal3313@agra.co.kr", status: "재직", phone: "010-8665-0307" },
  { empNo: "202402044", name: "박재원", birth: null, title: "선임주임", join: "2024-02-27", brand: "본사", team: "영업팀", email: "zxcjeff0921@agra.co.kr", status: "재직", phone: "010-8853-9731" },
  { empNo: "202508025", name: "백유나", birth: "1995-03-31", title: "사원", join: "2025-08-13", brand: "본사", team: "인사팀", email: "yundoyy@agra.co.kr", status: "재직", phone: "010-2729-9803" },
  { empNo: "202409016", name: "신선주", birth: "1989-06-17", title: "과장", join: "2024-09-19", brand: "본사", team: "비서실", email: "sjshin@agra.co.kr", status: "재직", phone: "010-4999-9889" },
  { empNo: "202510035", name: "유혜빈", birth: "1997-07-31", title: "사원", join: "2025-10-27", brand: "본사", team: "재무팀", email: "been7917@agra.co.kr", status: "재직", phone: "010-8355-7917" },
  { empNo: "202111034", name: "이민하", birth: "1996-01-01", title: "과장", join: "2021-11-15", brand: "본사", team: "기획팀", email: "min_ha@agra.co.kr", status: "재직", phone: "010-4614-3101" },
  { empNo: "202601026", name: "이반석", birth: null, title: "선임주임", join: "2026-01-15", brand: "본사", team: "영업팀", email: "halfstone@agra.co.kr", status: "재직", phone: "010-8644-8317" },
  { empNo: "202502005", name: "이영호", birth: "1987-11-14", title: "선임대리", join: "2025-02-03", brand: "본사", team: "영업팀", email: "sjket@agra.co.kr", status: "재직", phone: "010-2770-1120" },
  { empNo: "202501063", name: "이장훈", birth: "1996-02-04", title: "선임주임", join: "2025-01-20", brand: "본사", team: "QC팀", email: "leejamong96@agra.co.kr", status: "재직", phone: "010-9364-8153" },
  { empNo: "202307022", name: "이창대", birth: "1984-07-16", title: "과장", join: "2023-07-10", brand: "본사", team: "경영지원팀", email: "lcd1205@agra.co.kr", status: "휴직", phone: "010-8208-1205" },
  { empNo: "202403052", name: "이한울", birth: "1992-12-12", title: "선임대리", join: "2024-03-25", brand: "본사", team: "영업팀", email: "lee_hanol@agra.co.kr", status: "휴직", phone: "010-5615-6568" },
  { empNo: "202111030", name: "이현주", birth: "1991-03-22", title: "선임주임", join: "2021-11-08", brand: "본사", team: "경영지원팀", email: "judith@agra.co.kr", status: "재직", phone: "010-8220-9527" },
  { empNo: "201602001", name: "장경연", birth: "1990-03-21", title: "과장", join: "2016-02-08", brand: "본사", team: "인사팀", email: "jangky90@agra.co.kr", status: "재직", phone: "010-4263-5575" },
  { empNo: "202109021", name: "장미희", birth: "1992-02-22", title: "선임대리", join: "2021-09-06", brand: "본사", team: "인사팀", email: "mih022@agra.co.kr", status: "재직", phone: "010-6700-0662" },
  { empNo: "202311002", name: "정주영", birth: "1985-08-17", title: "선임대리", join: "2023-11-01", brand: "본사", team: "QC팀", email: "jjy1956@agra.co.kr", status: "재직", phone: "010-4129-1956" },
  { empNo: "202402015", name: "한미란", birth: "1984-09-24", title: "차장", join: "2024-02-13", brand: "본사", team: "재무팀", email: "hmr@agra.co.kr", status: "재직", phone: "010-2955-9024" },
  { empNo: "202502018", name: "황새미나라", birth: "1991-11-17", title: "선임주임", join: "2025-02-10", brand: "본사", team: "영업팀", email: "raaa17@agra.co.kr", status: "재직", phone: "010-3602-1729" }
];

async function seedHQ() {
  const defaultPasswordHash = await bcrypt.hash('1234', 10);
  let count = 0;
  for (const emp of rawData) {
    try {
      const statusEng = emp.status === "휴직" ? "ON_LEAVE" : emp.status === "퇴사" ? "RESIGNED" : "ACTIVE";
      
      // Determine Role based on title parsing
      let systemRole = "HQ_STAFF";
      if (emp.title === "팀장" || emp.title === "과장" || emp.title === "차장" || emp.title === "부장") systemRole = "HQ_TEAM_LEADER";
      if (emp.title.includes("본부장") || emp.title.includes("이사") || emp.title.includes("전무") || emp.title.includes("상무")) systemRole = "HEAD_OF_MANAGEMENT";
      if (emp.team === "인사팀") systemRole = "HR_ADMIN";

      await prisma.user.upsert({
        where: { employeeNumber: emp.empNo },
        update: {
          name: emp.name,
          brand: emp.brand,
          storeName: emp.team,
          department: emp.team,
          jobTitle: emp.title,
          birthDate: emp.birth,
          status: statusEng,
          phone: emp.phone,
          email: emp.email,
        },
        create: {
          employeeNumber: emp.empNo,
          passwordHash: defaultPasswordHash,
          name: emp.name,
          brand: emp.brand,
          storeId: 'hq-001',
          storeName: emp.team,
          department: emp.team,
          role: systemRole,
          jobTitle: emp.title,
          employmentType: '정규 연봉직(직원)',
          status: statusEng,
          phone: emp.phone,
          email: emp.email,
          birthDate: emp.birth,
          joinedAt: new Date(emp.join),
        }
      });
      count++;
      console.log(`[SUCCESS] Upserted ${emp.name} (${emp.empNo})`);
    } catch (err) {
      console.error(`[ERROR] Failed to upsert ${emp.name}`, err);
    }
  }
  console.log(`Total successful: ${count}/${rawData.length}`);
}

seedHQ().then(() => {
  console.log("Done");
  process.exit(0);
});
