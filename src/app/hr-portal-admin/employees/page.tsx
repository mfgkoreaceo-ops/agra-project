"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UploadCloud, Download, Search, FileImage, ArrowUpDown } from "lucide-react";
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
    phone?: string;
    joinedAt: string;
    is2faEnabled: boolean;
    healthCertificateExp?: string | null;
    healthCertificateUrl?: string | null;
    jobTitle?: string | null;
};

const getDisplayStoreName = (emp: Employee) => {
    if (!emp.storeName || emp.storeName.toUpperCase() === 'HQ' || emp.storeName === '본사') return '본사';
    const brandStr = (emp.brand || "").toUpperCase();
    let brandPrefix = "아그라";
    if (brandStr.includes("NY") || brandStr.includes("NOYA")) brandPrefix = "노야";

    return `${brandPrefix} ${emp.storeName}`.trim();
};

export default function EmployeesDirectory() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [leaveData, setLeaveData] = useState<any>(null);
    const [isUpdatingLeave, setIsUpdatingLeave] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isResettingPwd, setIsResettingPwd] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Employee | 'healthExp' | 'departmentRole'; direction: 'asc' | 'desc' } | null>(null);

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

    const handleResetPassword = async () => {
        if (!selectedEmployee || !currentUser) return;
        if (!newPassword || newPassword.length < 4) {
            alert("비밀번호는 최소 4자리 이상 입력해주세요.");
            return;
        }

        if (!confirm(`[경고] ${selectedEmployee.name} 직원의 비밀번호를 강제 초기화하시겠습니까?`)) return;

        setIsResettingPwd(true);
        try {
            const res = await fetch("/api/hr/employees/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: selectedEmployee.id,
                    adminId: currentUser.employeeNumber,
                    newPassword
                })
            });

            if (res.ok) {
                alert("비밀번호가 성공적으로 변경되었습니다. 해당 직원에게 새 비밀번호를 안내해 주세요.");
                setNewPassword("");
            } else {
                const err = await res.json();
                alert(`비밀번호 변경 실패: ${err.error}`);
            }
        } catch (error) {
            console.error("Password reset error:", error);
            alert("서버 오류가 발생했습니다.");
        } finally {
            setIsResettingPwd(false);
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

    const handleSort = (key: keyof Employee | 'healthExp' | 'departmentRole') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredEmployees = useMemo(() => {
        let result = employees.filter(emp => {
            const searchLower = searchTerm.toLowerCase().replace(/\s/g, "");
            const nameStrict = (emp.name || "").toLowerCase().replace(/\s/g, "");
            const empNumStrict = (emp.employeeNumber || "").toLowerCase().replace(/\s/g, "");
            const storeStrict = (emp.storeName || "").toLowerCase().replace(/\s/g, "");
            const brandStoreStrict = `${emp.brand || ""}${emp.storeName || ""}`.toLowerCase().replace(/\s/g, "");
            const displayStoreStrict = getDisplayStoreName(emp).toLowerCase().replace(/\s/g, "");

            return nameStrict.includes(searchLower) ||
                empNumStrict.includes(searchLower) ||
                storeStrict.includes(searchLower) ||
                brandStoreStrict.includes(searchLower) ||
                displayStoreStrict.includes(searchLower);
        });

        if (sortConfig !== null) {
            result.sort((a, b) => {
                let aValue: any = "";
                let bValue: any = "";

                if (sortConfig.key === 'healthExp') {
                    aValue = a.healthCertificateExp ? new Date(a.healthCertificateExp).getTime() : 0;
                    bValue = b.healthCertificateExp ? new Date(b.healthCertificateExp).getTime() : 0;
                } else if (sortConfig.key === 'departmentRole') {
                    aValue = `${a.department} ${a.jobTitle || a.role}`;
                    bValue = `${b.department} ${b.jobTitle || b.role}`;
                } else if (sortConfig.key === 'storeName') {
                    aValue = getDisplayStoreName(a);
                    bValue = getDisplayStoreName(b);
                } else if (sortConfig.key === 'joinedAt') {
                    aValue = new Date(a.joinedAt).getTime();
                    bValue = new Date(b.joinedAt).getTime();
                } else {
                    aValue = a[sortConfig.key] || "";
                    bValue = b[sortConfig.key] || "";
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [employees, searchTerm, sortConfig]);

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
                            <th onClick={() => handleSort('employeeNumber')} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>
                                사번 <ArrowUpDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                            </th>
                            <th onClick={() => handleSort('name')} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>
                                이름 <ArrowUpDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                            </th>
                            <th onClick={() => handleSort('storeName')} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>
                                소속 매장 <ArrowUpDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                            </th>
                            <th onClick={() => handleSort('departmentRole')} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>
                                부서/직급 <ArrowUpDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                            </th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", whiteSpace: "nowrap" }}>
                                연락처
                            </th>
                            <th onClick={() => handleSort('healthExp')} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>
                                보건증 만료일 <ArrowUpDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                            </th>
                            <th onClick={() => handleSort('joinedAt')} style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", cursor: "pointer", whiteSpace: "nowrap" }}>
                                입사일 <ArrowUpDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                            </th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563", whiteSpace: "nowrap" }}>상세</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : sortedAndFilteredEmployees.length === 0 ? (
                            <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>직원 데이터가 없습니다.</td></tr>
                        ) : (
                            sortedAndFilteredEmployees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>{emp.employeeNumber}</td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827" }}>{emp.name}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 600 }}>{getDisplayStoreName(emp)}</div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontSize: "0.9rem", color: "#111827" }}>{emp.department}</div>
                                        <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "99px", fontSize: "0.8rem", color: "#4b5563", marginTop: "0.25rem", fontWeight: 500 }}>
                                            {emp.jobTitle || emp.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>{emp.phone || '-'}</td>
                                    <td style={{ padding: "1rem", fontSize: "0.85rem" }}>
                                        {(() => {
                                            if (!emp.healthCertificateExp) return <span style={{ color: "#dc2626", fontWeight: 600, backgroundColor: "#fef2f2", padding: "0.2rem 0.4rem", borderRadius: "0.25rem" }}>미제출</span>;

                                            const expDate = new Date(emp.healthCertificateExp);
                                            const daysDiff = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                            if (daysDiff < 0) {
                                                return <div style={{ color: "#dc2626", fontWeight: "bold" }}>{expDate.toLocaleDateString()}<br /><span style={{ fontSize: "0.75rem", backgroundColor: "#fef2f2", padding: "0.1rem 0.3rem", borderRadius: "0.2rem" }}>만료됨</span></div>;
                                            } else if (daysDiff <= 30) {
                                                return <div style={{ color: "#d97706", fontWeight: "bold" }}>{expDate.toLocaleDateString()}<br /><span style={{ fontSize: "0.75rem", backgroundColor: "#fffbeb", padding: "0.1rem 0.3rem", borderRadius: "0.2rem" }}>{daysDiff}일 남음</span></div>;
                                            } else {
                                                return <span style={{ color: "#16a34a" }}>{expDate.toLocaleDateString()}</span>;
                                            }
                                        })()}
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                        {new Date(emp.joinedAt).toLocaleDateString()}
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
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
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

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ padding: "0.5rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem" }}>
                                                <FileImage size={24} color="#6b7280" />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "black" }}>보건증 사본</p>
                                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#4b5563" }}>
                                                    {selectedEmployee.healthCertificateExp ? `${new Date(selectedEmployee.healthCertificateExp).toLocaleDateString()} 만료` : '미제출'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedEmployee.healthCertificateUrl ? (
                                            <button
                                                onClick={() => selectedEmployee.healthCertificateUrl && window.open(selectedEmployee.healthCertificateUrl, '_blank')}
                                                style={{ padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.85rem" }}
                                            >
                                                열람
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: "0.8rem", color: "#9ca3af", padding: "0.5rem 1rem" }}>미등록</span>
                                        )}
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

                        {currentUser && ["HR_ADMIN", "HEAD_OF_MANAGEMENT"].includes(currentUser.role) && (
                            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    비밀번호 강제 초기화
                                </h3>
                                <p style={{ fontSize: "0.85rem", color: "#4b5563", marginBottom: "1rem" }}>
                                    직원이 비밀번호를 분실하였거나 초기 접속에 문제가 있을 때 새로운 임시 비밀번호를 강제 지정해줄 수 있습니다.
                                </p>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>새 비밀번호 입력</label>
                                        <input
                                            type="text"
                                            placeholder="초기화할 비밀번호 입력 (예: 1234)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", outline: "none" }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isResettingPwd || newPassword.length === 0}
                                        style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.5rem", cursor: (isResettingPwd || newPassword.length === 0) ? "not-allowed" : "pointer", fontWeight: 500 }}
                                    >
                                        {isResettingPwd ? "초기화 중..." : "초기화 실행"}
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
