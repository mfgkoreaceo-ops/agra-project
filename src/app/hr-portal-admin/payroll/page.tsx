"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Download, Search, CheckCircle, Clock } from "lucide-react";
import * as XLSX from "xlsx";

type PayrollRecord = {
    id: string;
    paymentMonth: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netPay: number;
    status: string;
    employee: {
        name: string;
        employeeNumber: string;
        storeName: string;
        department: string;
    }
};

export default function PayrollPage() {
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPayroll = async () => {
        try {
            const res = await fetch("/api/hr/payroll");
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load payroll", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

                const payload = jsonData.map((row) => ({
                    employeeNumber: row["사번"],
                    month: row["귀속월"] ? String(row["귀속월"]) : new Date().toISOString().substring(0, 7),
                    baseSalary: Number(row["기본급"]) || 0,
                    bonus: Number(row["상여금"]) || 0,
                    deductions: Number(row["공제액"]) || 0,
                    netPay: Number(row["실수령액"]) || 0,
                    paymentDate: row["지급일"] ? new Date(row["지급일"]).toISOString() : new Date().toISOString(),
                    status: row["상태"] || "Paid",
                })).filter(e => e.employeeNumber);

                alert(`${payload.length}건의 급여 데이터를 업로드합니다.`);

                const res = await fetch("/api/hr/payroll", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ records: payload })
                });

                if (res.ok) {
                    alert("업로드 완료");
                    fetchPayroll();
                } else {
                    const err = await res.json();
                    alert("업로드 실패: " + err.error + "\n" + (err.errors?.join("\n") || ""));
                }
            } catch (error) {
                console.error("Parse error", error);
                alert("엑셀 파일 파싱에 실패했습니다.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const template = [
            { "사번": "AG-2024-001", "귀속월": "2026-03", "기본급": 3500000, "상여금": 500000, "공제액": 350000, "실수령액": 3650000, "지급일": "2026-03-25", "상태": "Paid" }
        ];
        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "급여업로드_템플릿.xlsx");
    };

    const filteredRecords = records.filter(rec =>
        rec.employee?.name.includes(searchTerm) ||
        rec.employee?.employeeNumber.includes(searchTerm) ||
        rec.paymentMonth.includes(searchTerm)
    );

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>통합 급여 및 정산 관리</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        아그라 및 노야 전 매장 임직원의 급여 대장 및 명세서 일괄 처리
                    </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={handleDownloadTemplate}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "0.5rem", color: "#374151", cursor: "pointer", fontWeight: 500 }}
                    >
                        <Download size={16} /> 템플릿 다운로드
                    </button>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#1e3a8a", border: "none", borderRadius: "0.5rem", color: "white", cursor: "pointer", fontWeight: 500 }}>
                        <UploadCloud size={16} /> 대량 급여 엑셀 연동
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                    <input
                        type="text"
                        placeholder="이름, 사번, 귀속월(YYYY-MM) 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                    />
                </div>
            </div>

            <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                    <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>귀속월</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>사번/이름</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>부서/매장</th>
                            <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.85rem", color: "#4b5563" }}>기본급</th>
                            <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.85rem", color: "#4b5563" }}>수당/상여</th>
                            <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.85rem", color: "#4b5563" }}>실수령액</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#4b5563" }}>지급상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : filteredRecords.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>급여 명세서 데이터가 없습니다.</td></tr>
                        ) : (
                            filteredRecords.map(rec => (
                                <tr key={rec.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "1rem", fontWeight: 600 }}>{rec.paymentMonth}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontWeight: 500, color: "#111827" }}>{rec.employee?.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{rec.employee?.employeeNumber}</div>
                                    </td>
                                    <td style={{ padding: "1rem", color: "#4b5563" }}>{rec.employee?.storeName} ({rec.employee?.department})</td>
                                    <td style={{ padding: "1rem", textAlign: "right", color: "#4b5563" }}>{rec.baseSalary.toLocaleString()}원</td>
                                    <td style={{ padding: "1rem", textAlign: "right", color: "#10b981" }}>+{rec.allowances.toLocaleString()}원</td>
                                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: "bold", color: "#111827", fontSize: "1.1rem" }}>
                                        {rec.netPay.toLocaleString()}원
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {rec.status === 'PAID' ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", backgroundColor: "#dcfce7", color: "#16a34a", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <CheckCircle size={12} /> 완료
                                            </span>
                                        ) : (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <Clock size={12} /> 품의중
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
