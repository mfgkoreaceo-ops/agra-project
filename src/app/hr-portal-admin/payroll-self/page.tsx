"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, Clock } from "lucide-react";

type PayrollRecord = {
    id: string;
    paymentMonth: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netPay: number;
    status: string;
};

export default function PayrollSelfPage() {
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPayroll = async (user: any) => {
        try {
            const res = await fetch(`/api/hr/payroll?requesterId=${user.employeeNumber}&view=self`);
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load payroll", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) {
            fetchPayroll(JSON.parse(storedUser));
        }
    }, []);

    const filteredRecords = records.filter(rec =>
        rec.paymentMonth.includes(searchTerm)
    );

    return (
        <div style={{ paddingBottom: "3rem", maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>나의 급여 명세서</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        개인별 월간 급여 정산 내역 및 원천징수 내역
                    </p>
                </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                    <input
                        type="text"
                        placeholder="귀속월(YYYY-MM) 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                    />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {loading ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</div>
                ) : filteredRecords.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", backgroundColor: "white", borderRadius: "0.75rem", border: "1px dashed #d1d5db" }}>급여 명세서 내역이 없습니다. (인사팀 승인 대기 또는 처리 전)</div>
                ) : (
                    filteredRecords.map(rec => (
                        <div key={rec.id} style={{ backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb", padding: "2rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#111827" }}>{rec.paymentMonth}월 급여 명세서</h3>
                                </div>
                                <div>
                                    {rec.status === 'PAID' ? (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.75rem", backgroundColor: "#dcfce7", color: "#16a34a", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 600 }}>
                                            <CheckCircle size={14} /> 정산 완료
                                        </span>
                                    ) : (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.75rem", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 600 }}>
                                            <Clock size={14} /> 처리 진행 중
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                <div>
                                    <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", color: "#4b5563", borderBottom: "2px solid #111827", paddingBottom: "0.5rem", display: "inline-block" }}>지급 내역</h4>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                        <span style={{ color: "#4b5563" }}>기본급</span>
                                        <span style={{ fontWeight: 500 }}>{rec.baseSalary.toLocaleString()}원</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#4b5563" }}>연장수당 / 상여금</span>
                                        <span style={{ fontWeight: 500, color: "#10b981" }}>+{rec.allowances.toLocaleString()}원</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", color: "#4b5563", borderBottom: "2px solid #ef4444", paddingBottom: "0.5rem", display: "inline-block" }}>공제 내역 (원천징수)</h4>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                        <span style={{ color: "#4b5563" }}>4대보험 및 소득세</span>
                                        <span style={{ fontWeight: 500, color: "#ef4444" }}>-{rec.deductions.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: "2rem", backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#334155" }}>차인지급액 (실수령액)</span>
                                <span style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#2563eb" }}>{rec.netPay.toLocaleString()} 원</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
