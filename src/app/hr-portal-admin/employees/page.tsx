"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Download, Search, FileImage } from "lucide-react";
import * as XLSX from "xlsx";

type Employee = {
    id: string;
    employeeNumber: string;
    name: string;
    brand: string;
    storeName: string;
    department: string;
    role: string;
    employmentType: string;
    status: string;
    phone: string;
    joinedAt: string;
    is2faEnabled: boolean;
};

export default function EmployeesDirectory() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [leaveData, setLeaveData] = useState<any>(null);
    const [isUpdatingLeave, setIsUpdatingLeave] = useState(false);

    const fetchEmployees = async () => {
        try {
            const storedUser = localStorage.getItem("hr_user");
            if (!storedUser) return;
            const user = JSON.parse(storedUser);
            setCurrentUser(user);

            const res = await fetch(`/api/hr/employees?requesterId=${user.employeeNumber}`);
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            setLeaveData(null);
            fetch(`/api/hr/leave/adjust?employeeId=${selectedEmployee.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.leave) {
                        setLeaveData({ totalDays: data.leave.totalDays, usedDays: data.leave.usedDays });
                    }
                })
                .catch(err => console.error("Failed to fetch leave", err));
        }
    }, [selectedEmployee]);

    const handleUpdateLeave = async () => {
        if (!selectedEmployee || !leaveData) return;
        setIsUpdatingLeave(true);
        try {
            const res = await fetch("/api/hr/leave/adjust", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: selectedEmployee.id,
                    totalDays: parseFloat(leaveData.totalDays),
                    usedDays: parseFloat(leaveData.usedDays)
                })
            });
            if (res.ok) {
                alert("연차 정보가 성공적으로 업데이트 되었습니다.");
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            alert("연차 업데이트 중 오류가 발생했습니다.");
        } finally {
            setIsUpdatingLeave(false);
        }
    };

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

                // Map to API payload
                const payload = jsonData.map((row) => ({
                    employeeNumber: row["사번"],
                    name: row["이름"],
                    brand: row["소속 브랜드"] || "HQ",
                    storeId: row["매장코드"],
                    storeName: row["매장명"],
                    department: row["부서"],
                    role: row["직급"] || "STAFF",
                    employmentType: row["고용형태"] || "Full-Time",
                    status: row["상태"] || "Active",
                    phone: row["연락처"],
                    email: row["이메일"],
                    joinedAt: row["입사일"] ? new Date(row["입사일"]).toISOString() : undefined,
                })).filter(e => e.employeeNumber && e.name); // basic validation

                alert(`${payload.length}명의 직원 데이터를 업로드합니다.`);

                const res = await fetch("/api/hr/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employees: payload })
                });

                if (res.ok) {
                    alert("업로드 완료");
                    fetchEmployees();
                } else {
                    const err = await res.json();
                    alert("업로드 실패: " + err.error);
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
            { "사번": "AG-2026-001", "이름": "홍길동", "소속 브랜드": "AGRA", "매장코드": "1", "매장명": "센터필드점", "부서": "홀", "직급": "STAFF", "고용형태": "Full-Time", "상태": "Active", "연락처": "010-1234-5678", "이메일": "test@agra.co.kr", "입사일": "2026-01-01" }
        ];
        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "직원등록_템플릿.xlsx");
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.includes(searchTerm) ||
        emp.employeeNumber.includes(searchTerm) ||
        emp.storeName.includes(searchTerm)
    );

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>통합 임직원 명부</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        대량 등록 및 개인정보 열람
                    </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={handleDownloadTemplate}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "0.5rem", color: "#374151", fontSize: "0.9rem", cursor: "pointer", fontWeight: 500 }}
                    >
                        <Download size={16} /> 업로드 템플릿 다운로드
                    </button>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#10b981", border: "none", borderRadius: "0.5rem", color: "white", fontSize: "0.9rem", cursor: "pointer", fontWeight: 500 }}>
                        <UploadCloud size={16} /> 엑셀 대량 업로드
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                </div>
            </div>

            {/* Filter */}
            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                    <input
                        type="text"
                        placeholder="이름, 사번, 매장명 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                    <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>사번</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>이름</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>브랜드/매장</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>부서/직급</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>연락처</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>입사일</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>2FA</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>상세</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>직원 데이터가 없습니다.</td></tr>
                        ) : (
                            filteredEmployees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>{emp.employeeNumber}</td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827" }}>{emp.name}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontSize: "0.9rem", color: "#111827" }}>{emp.brand}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{emp.storeName}</div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontSize: "0.9rem", color: "#111827" }}>{emp.department}</div>
                                        <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "99px", fontSize: "0.75rem", color: "#4b5563", marginTop: "0.25rem" }}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>{emp.phone || '-'}</td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                        {new Date(emp.joinedAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {emp.is2faEnabled ? (
                                            <span style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: 600 }}>설정됨</span>
                                        ) : (
                                            <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>미설정</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => setSelectedEmployee(emp)}
                                            style={{ padding: "0.4rem 0.75rem", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "0.25rem", fontSize: "0.8rem", cursor: "pointer" }}
                                        >
                                            상세
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Employee Details Modal (Specifically showing ID card and Bank info) */}
            {selectedEmployee && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", width: "100%", maxWidth: "600px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", margin: 0, color: "black" }}>{selectedEmployee.name} - 상세 정보</h2>
                            <button onClick={() => setSelectedEmployee(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "black" }}>&times;</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div>
                                <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>사번</p>
                                <p style={{ margin: 0, fontWeight: 600, color: "black" }}>{selectedEmployee.employeeNumber}</p>
                            </div>
                            <div>
                                <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#4b5563" }}>상태</p>
                                <p style={{ margin: 0, fontWeight: 600, color: "black" }}>{selectedEmployee.status}</p>
                            </div>
                        </div>

                        {currentUser && (["HR_ADMIN", "HEAD_OF_MANAGEMENT"].includes(currentUser.role) || currentUser.employeeNumber === selectedEmployee.employeeNumber) && (
                            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#111827" }}>
                                    <FileText size={18} /> 개인정보 및 증명 서류
                                </h3>
                                <p style={{ fontSize: "0.85rem", color: "#ef4444", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                                    🚨 **주의**: 본 정보는 인사팀 최고 관리자 및 본인만 열람 가능한 민감 정보입니다.
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ padding: "0.5rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem" }}>
                                                <FileImage size={24} color="#6b7280" />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "black" }}>주민등록증 / 신분증 사본</p>
                                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#4b5563" }}>id_card_front.jpg</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => alert(`보안 연결 뷰어를 띄웁니다: ${selectedEmployee.name}의 신분증 사본`)}
                                            style={{ padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.85rem" }}
                                        >
                                            열람
                                        </button>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ padding: "0.5rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem" }}>
                                                <FileImage size={24} color="#6b7280" />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "black" }}>급여 수령 통장 사본</p>
                                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#4b5563" }}>bank_book_copy.jpg</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => alert(`보안 연결 뷰어를 띄웁니다: ${selectedEmployee.name}의 통장 사본`)}
                                            style={{ padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.85rem" }}
                                        >
                                            열람
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentUser && ["HR_ADMIN", "HEAD_OF_MANAGEMENT"].includes(currentUser.role) && leaveData && (
                            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#111827" }}>수동 연차 조정</h3>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>총 발생 연차</label>
                                        <input 
                                            type="number" 
                                            step="0.5"
                                            value={leaveData.totalDays} 
                                            onChange={(e) => setLeaveData({ ...leaveData, totalDays: e.target.value })} 
                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", outline: "none" }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>사용 연차</label>
                                        <input 
                                            type="number" 
                                            step="0.5"
                                            value={leaveData.usedDays} 
                                            onChange={(e) => setLeaveData({ ...leaveData, usedDays: e.target.value })} 
                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", outline: "none" }}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleUpdateLeave}
                                        disabled={isUpdatingLeave}
                                        style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: isUpdatingLeave ? "not-allowed" : "pointer", fontWeight: 500 }}
                                    >
                                        {isUpdatingLeave ? "저장 중..." : "저장"}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

// Ensure icons used in modal are imported dynamically if needed, or re-add FileText
import { FileText } from "lucide-react";
