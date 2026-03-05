"use client";

import React, { useState } from "react";
import { Download, Upload, AlertCircle, DollarSign, CheckCircle } from "lucide-react";
import { useHR, PayrollRecord } from "../HRContext";
import { parsePayrollExcel, exportToCSV } from "../utils/excelParser";

export default function PayrollAdmin() {
    const { hrState, updateHRState } = useHR();
    const [isUploading, setIsUploading] = useState(false);

    const handlePayrollUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const parsedRecords = await parsePayrollExcel(file);

            // Critical Step: Match '사번' (from Excel) to actual 'employeeId' (UUID) in HR DB
            // We temporarily stored '사번' in the employeeId field during parsing as a placeholder
            let matchedCount = 0;
            const validRecords = parsedRecords.map(record => {
                const emp = hrState.employees.find(e => e.employeeNumber === record.employeeId);
                if (emp) {
                    matchedCount++;
                    return { ...record, employeeId: emp.id }; // Replace with real UUID
                }
                return null;
            }).filter(Boolean) as PayrollRecord[];

            updateHRState({ payrollRecords: [...validRecords, ...hrState.payrollRecords] });
            alert(`총 ${parsedRecords.length}건 중 ${matchedCount}명의 임금 명세서가 성공적으로 업로드 되었습니다.`);
        } catch (error) {
            console.error("Upload failed", error);
            alert("엑셀 파일 분석 중 오류가 발생했습니다. 양식을 확인해주세요.");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleDownloadCSV = () => {
        if (hrState.payrollRecords.length === 0) {
            alert("다운로드할 급여 데이터가 없습니다.");
            return;
        }

        // Map internal data to Excel-friendly Korean column names
        const exportData = hrState.payrollRecords.map(pay => {
            const emp = hrState.employees.find(e => e.id === pay.employeeId);
            return {
                "사번": emp ? emp.employeeNumber : pay.employeeId,
                "이름": emp ? emp.name : "알수없음",
                "귀속월": pay.month,
                "기본급": pay.baseSalary,
                "상여/수당": pay.bonus,
                "공제액": pay.deductions,
                "실수령액": pay.netPay,
                "급여계좌은행": emp ? emp.bankName : "",
                "계좌번호": emp ? emp.accountNumber : "",
                "지급일": pay.paymentDate,
                "상태": pay.status === "Paid" ? "지급 완료" : "지급 대기"
            };
        });

        exportToCSV(exportData, `급여대장_${new Date().toISOString().split("T")[0]}`);
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>월별 급여 대장 (Payroll)</h2>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>이체용 엑셀 다운로드 및 급여 명세서 일괄 발송</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <label className="btn-hr btn-hr-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", opacity: isUploading ? 0.5 : 1 }}>
                        <Upload size={18} /> {isUploading ? "업로드 중..." : "엑셀 일괄 업로드"}
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handlePayrollUpload} disabled={isUploading} style={{ display: "none" }} />
                    </label>
                    <button onClick={handleDownloadCSV} className="btn-hr btn-hr-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#10b981" }}>
                        <Download size={18} /> 은행 이체용 CSV 다운로드
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem 1.5rem", borderRadius: "0.5rem", display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <AlertCircle size={20} color="#3b82f6" style={{ marginTop: "0.1rem" }} />
                <div>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#1e3a8a", fontSize: "0.95rem" }}>데이터 보안 알림</h4>
                    <p style={{ margin: 0, color: "#1e40af", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        이 페이지의 급여 정보(기본급, 계좌번호 등)는 저장 시 <strong>AES-256 데이터 암호화(Encryption at rest)</strong>가 적용됩니다.<br />
                        데이터는 브라우저 로컬 저장소에 암호화된 상태로 보관되며, 접근 키가 있어야만 복호화되어 열람할 수 있습니다.
                    </p>
                </div>
            </div>

            {hrState.payrollRecords.length === 0 ? (
                <div style={{ background: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", padding: "4rem 2rem", textAlign: "center", color: "#6b7280", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <DollarSign size={48} style={{ color: "#d1d5db", margin: "0 auto 1rem auto" }} />
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>2026년 2월 급여 대장 대기 중</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>아직 이번 달 급여 명세서 배치가 업로드되지 않았습니다.</p>
                </div>
            ) : (
                <div style={{ background: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <table>
                        <thead style={{ backgroundColor: "#f9fafb" }}>
                            <tr>
                                <th>귀속월</th>
                                <th>직원 사번</th>
                                <th>기본급</th>
                                <th>상여/수당</th>
                                <th>공제액 (세금 등)</th>
                                <th>실수령액 (Net Pay)</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hrState.payrollRecords.map((pay) => {
                                const emp = hrState.employees.find(e => e.id === pay.employeeId);
                                return (
                                    <tr key={pay.id}>
                                        <td style={{ fontWeight: 600 }}>{pay.month}</td>
                                        <td>{emp ? `${emp.name} (${emp.employeeNumber})` : pay.employeeId}</td>
                                        <td style={{ color: "#4f46e5" }}>{pay.baseSalary.toLocaleString()}원</td>
                                        <td style={{ color: "#059669" }}>+{pay.bonus.toLocaleString()}원</td>
                                        <td style={{ color: "#dc2626" }}>-{pay.deductions.toLocaleString()}원</td>
                                        <td style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{pay.netPay.toLocaleString()}원</td>
                                        <td>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", borderRadius: "99px", fontSize: "0.75rem", backgroundColor: pay.status === "Paid" ? "#d1fae5" : "#fef3c7", color: pay.status === "Paid" ? "#065f46" : "#92400e" }}>
                                                {pay.status === "Paid" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                {pay.status === "Paid" ? "지급 완료" : "초안 (지급 대기)"}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
