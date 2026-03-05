import * as XLSX from "xlsx";
import { Employee, Brand, EmployeeRole, EmploymentType, EmployeeStatus, PayrollRecord } from "../HRContext";

export function parseEmployeeExcel(file: File): Promise<Partial<Employee>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                // Parse Excel locally via library
                const workbook = XLSX.read(data, { type: "binary" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert worksheet to an array of objects
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                // Map raw Excel rows to Employee Interface
                const employees: Partial<Employee>[] = jsonData.map((row) => ({
                    id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Auto generate UUID
                    employeeNumber: row["사번"] || "",
                    name: row["이름"] || "",
                    brand: (row["소속 브랜드"] as Brand) || "HQ",
                    storeId: row["매장코드"] || "hq",
                    storeName: row["매장명"] || "본사",
                    department: row["부서"] || "운영팀",
                    role: (row["직급"] as EmployeeRole) || "Hall Staff",
                    employmentType: (row["고용형태"] as EmploymentType) || "Full-Time",
                    status: (row["상태"] as EmployeeStatus) || "Active",
                    phone: row["연락처"] || "",
                    email: row["이메일"] || "",
                    address: row["주소"] || "",
                    joinDate: row["입사일"] ? String(row["입사일"]) : new Date().toISOString().split("T")[0],
                    annualLeaveTotal: Number(row["총 연차"]) || 15,
                    annualLeaveUsed: Number(row["사용 연차"]) || 0,
                    baseSalary: Number(row["기본급(월)"]) || 0,
                    bankName: row["급여은행"] || "",
                    accountNumber: row["계좌번호"] || ""
                }));

                resolve(employees);
            } catch (error) {
                console.error("Excel parse error:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
}

export function parsePayrollExcel(file: File): Promise<Partial<PayrollRecord>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                const records: Partial<PayrollRecord>[] = jsonData.map((row) => ({
                    id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    employeeId: row["사번"] || "", // Assuming the excel has 사번 and we match it later, or it directly has employeeId if exported from the system
                    month: row["귀속월"] || new Date().toISOString().substring(0, 7), // "2026-02"
                    baseSalary: Number(row["기본급"]) || 0,
                    bonus: Number(row["상여금"]) || 0,
                    deductions: Number(row["공제액"]) || 0,
                    netPay: Number(row["실수령액"]) || 0,
                    paymentDate: row["지급일"] ? String(row["지급일"]) : new Date().toISOString().split("T")[0],
                    status: (row["상태"] as "Draft" | "Paid") || "Paid"
                }));

                resolve(records);
            } catch (error) {
                console.error("Excel parse error:", error);
                reject(error);
            }
        };

        reader.readAsBinaryString(file);
    });
}

export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        alert("다운로드할 데이터가 없습니다.");
        return;
    }

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate CSV string
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    // Create a Blob and trigger download
    const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" }); // \uFEFF for Excel UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
