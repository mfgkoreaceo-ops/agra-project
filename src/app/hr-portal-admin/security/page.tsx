"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Search, RefreshCw } from "lucide-react";

type Employee = {
    id: string;
    employeeNumber: string;
    name: string;
    storeName: string;
    department: string;
    is2faEnabled: boolean;
};

export default function SecurityPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, secured: 0, unsecured: 0 });

    const fetchSecurityStatus = async () => {
        try {
            const res = await fetch("/api/hr/employees"); // Reusing the employee GET route
            const data = await res.json();
            const employeeData = Array.isArray(data) ? data : [];
            setEmployees(employeeData);

            // Calculate stats
            const securedCount = employeeData.filter((e: Employee) => e.is2faEnabled).length;
            setStats({
                total: employeeData.length,
                secured: securedCount,
                unsecured: employeeData.length - securedCount
            });
        } catch (error) {
            console.error("Failed to load security status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecurityStatus();
    }, []);

    const handleReset2FA = async (employeeNumber: string, name: string) => {
        if (!confirm(`${name} (${employeeNumber})의 2FA 연결을 초기화 하시겠습니까?\n초기화 시 해당 직원은 다음 로그인 때 새 기기로 재인증을 거쳐야 합니다.`)) return;

        try {
            const res = await fetch("/api/hr/security/reset-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeNumber })
            });

            if (res.ok) {
                alert("초기화가 완료되었습니다.");
                fetchSecurityStatus();
            } else {
                alert("초기화 실패");
            }
        } catch (error) {
            console.error(error);
            alert("서버 연결 오류");
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.includes(searchTerm) ||
        emp.employeeNumber.includes(searchTerm) ||
        emp.storeName.includes(searchTerm)
    );

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>전사 보안 설정 (2FA)</h1>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                    임직원 Google Authenticator 연동 상태 모니터링 및 초기화
                </p>
            </div>

            {/* Shield Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ backgroundColor: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", color: "#4b5563" }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>전체 계정 수</p>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{stats.total}</p>
                    </div>
                </div>
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ backgroundColor: "#dcfce7", padding: "1rem", borderRadius: "0.5rem", color: "#16a34a" }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>2FA 설정 완료 (안전)</p>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#16a34a" }}>{stats.secured}</p>
                    </div>
                </div>
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", color: "#dc2626" }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>2FA 미설정 (취약)</p>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626" }}>{stats.unsecured}</p>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                    <input
                        type="text"
                        placeholder="이름, 사번, 매장명으로 검색"
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
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>사번</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>이름</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>소속 매장/부서</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#4b5563" }}>보안 상태 (2FA)</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#4b5563" }}>보안 조치</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>검색 결과가 없습니다.</td></tr>
                        ) : (
                            filteredEmployees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "1rem", color: "#111827", fontWeight: 500 }}>{emp.employeeNumber}</td>
                                    <td style={{ padding: "1rem", color: "#111827" }}>{emp.name}</td>
                                    <td style={{ padding: "1rem", color: "#6b7280", fontSize: "0.9rem" }}>{emp.storeName} ({emp.department})</td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {emp.is2faEnabled ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem", backgroundColor: "#dcfce7", color: "#16a34a", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <ShieldCheck size={12} /> 유지됨
                                            </span>
                                        ) : (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <ShieldAlert size={12} /> 미설정
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleReset2FA(emp.employeeNumber, emp.name)}
                                            disabled={!emp.is2faEnabled}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem",
                                                backgroundColor: emp.is2faEnabled ? "white" : "#f3f4f6",
                                                color: emp.is2faEnabled ? "#ef4444" : "#9ca3af",
                                                border: emp.is2faEnabled ? "1px solid #fca5a5" : "1px solid #e5e7eb",
                                                borderRadius: "0.25rem", fontSize: "0.8rem", cursor: emp.is2faEnabled ? "pointer" : "not-allowed", fontWeight: 500
                                            }}
                                        >
                                            <RefreshCw size={12} /> 2FA 강제 초기화
                                        </button>
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
