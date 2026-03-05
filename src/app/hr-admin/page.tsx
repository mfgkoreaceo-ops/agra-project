"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useHR, Employee, Brand, EmployeeRole, EmploymentType, EmployeeStatus } from "./HRContext";
import { Search, MapPin, Briefcase, Plus, Upload, Download, X } from "lucide-react";
import { parseEmployeeExcel, exportToCSV } from "./utils/excelParser";

export default function HRDashboard() {
    const { session } = useAuth();
    const router = useRouter();
    const { hrState, updateHRState } = useHR();
    const [searchTerm, setSearchTerm] = useState("");
    const [brandFilter, setBrandFilter] = useState<Brand | "ALL">("ALL");
    const [isUploading, setIsUploading] = useState(false);
    const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const [newEmpData, setNewEmpData] = useState<Partial<Employee>>({
        name: "", employeeNumber: "", storeName: "", brand: "HQ", role: "Hall Staff"
    });

    useEffect(() => {
        if (session && session.role !== "HR Admin" && session.role !== "Store Manager" && session.role !== "Assistant Manager" && session.role !== "Area Manager") {
            // General staff shouldn't be here, send to personal dashboard
            router.push("/hr-admin/dashboard");
        }
    }, [session, router]);

    if (!session) return null;

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const newEmployees = await parseEmployeeExcel(file);
            // Validations could go here
            updateHRState({ employees: [...newEmployees as Employee[], ...hrState.employees] });
            alert(`${newEmployees.length}명의 직원 정보가 일괄 등록되었습니다.`);
        } catch (error) {
            console.error("Upload failed", error);
            alert("엑셀 파일 분석 중 오류가 발생했습니다. 양식을 확인해주세요.");
        } finally {
            setIsUploading(false);
            e.target.value = ""; // reset input
        }
    };

    const handleDownloadCSV = () => {
        if (filteredEmployees.length === 0) {
            alert("다운로드할 직원 데이터가 없습니다.");
            return;
        }

        const exportData = filteredEmployees.map(emp => ({
            "사번": emp.employeeNumber,
            "이름": emp.name,
            "소속 브랜드": emp.brand,
            "매장명": emp.storeName,
            "부서": emp.department,
            "직급": emp.role,
            "고용형태": emp.employmentType,
            "상태": emp.status,
            "연락처": emp.phone,
            "이메일": emp.email,
            "입사일": emp.joinDate,
            "기본급(월)": emp.baseSalary
        }));

        exportToCSV(exportData, `직원명부_${new Date().toISOString().split("T")[0]}`);
    };

    const handleCreateEmployee = () => {
        if (!newEmpData.name || !newEmpData.employeeNumber) {
            alert("이름과 사번은 필수 입력 사항입니다.");
            return;
        }

        const newEmployee: Employee = {
            id: `emp-${Date.now()}`,
            employeeNumber: newEmpData.employeeNumber || "",
            name: newEmpData.name || "",
            brand: (newEmpData.brand as Brand) || "HQ",
            storeId: "new-store",
            storeName: newEmpData.storeName || "",
            department: "운영",
            role: (newEmpData.role as EmployeeRole) || "Hall Staff",
            employmentType: "Full-Time",
            status: "Active",
            phone: "", email: "", address: "",
            joinDate: new Date().toISOString().split("T")[0],
            annualLeaveTotal: 15, annualLeaveUsed: 0,
            baseSalary: 0, bankName: "", accountNumber: ""
        };

        updateHRState({ employees: [newEmployee, ...hrState.employees] });
        setShowNewEmployeeForm(false);
        setNewEmpData({ name: "", employeeNumber: "", storeName: "", brand: "HQ", role: "Hall Staff" });
        alert("신규 직원이 등록되었습니다.");
    };

    // Filter Logic
    const filteredEmployees = hrState.employees.filter((emp) => {
        // RBAC Filtering based on role hierarchy
        if (session.role === "Store Manager" || session.role === "Assistant Manager") {
            if (emp.storeId !== session.storeId) return false;
        } else if (session.role === "Area Manager") {
            if (emp.brand !== session.brand) return false;
        }

        const matchesSearch = emp.name.includes(searchTerm) || emp.employeeNumber.includes(searchTerm) || emp.storeName.includes(searchTerm);
        const matchesBrand = brandFilter === "ALL" || emp.brand === brandFilter;
        return matchesSearch && matchesBrand;
    });

    const activeCount = filteredEmployees.filter(e => e.status === "Active").length;
    const leaveCount = filteredEmployees.filter(e => e.status === "On Leave").length;

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
                        {session.role === "Store Manager" || session.role === "Assistant Manager" ? "매장 직원 목록" : "전체 직원 명부"}
                    </h2>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
                        {session.role === "Store Manager" || session.role === "Assistant Manager" ? "본인 소속 매장의 접근 가능한 직원 목록" : "아그라 및 노야 전 매장 직원 마스터 데이터"}
                    </p>
                </div>
                {session.role === "HR Admin" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={handleDownloadCSV} className="btn-hr btn-hr-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "white" }}>
                            <Download size={18} /> 명부 CSV 다운로드
                        </button>
                        <label className="btn-hr btn-hr-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", opacity: isUploading ? 0.5 : 1 }}>
                            <Upload size={18} /> {isUploading ? "처리 중..." : "엑셀 일괄 업로드"}
                            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} disabled={isUploading} style={{ display: "none" }} />
                        </label>
                        <button onClick={() => setShowNewEmployeeForm(true)} className="btn-hr btn-hr-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#3b82f6", borderColor: "#3b82f6" }}>
                            <Plus size={18} /> 신규 직원 등록
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>총 직원 수</p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", fontWeight: "bold", color: "#111827" }}>{filteredEmployees.length}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>재직 중</p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", fontWeight: "bold", color: "#059669" }}>{activeCount}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>휴직/연차 중</p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", fontWeight: "bold", color: "#d97706" }}>{leaveCount}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>결원 (퇴사 예정)</p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.8rem", fontWeight: "bold", color: "#dc2626" }}>0</p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", background: "white", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input
                        type="text"
                        placeholder="이름, 사번, 매장명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem" }}
                    />
                </div>
                <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value as Brand | "ALL")}
                    style={{ padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.95rem", backgroundColor: "white", minWidth: "150px" }}
                >
                    <option value="ALL">전체 브랜드</option>
                    <option value="AGRA">AGRA 전용</option>
                    <option value="NOYA">NOYA 전용</option>
                    <option value="HQ">본사 (HQ)</option>
                </select>
            </div>

            {/* Employee Table */}
            <div style={{ background: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: "5%" }}>#</th>
                            <th style={{ width: "15%" }}>사번 / 부서</th>
                            <th style={{ width: "20%" }}>직원 이름</th>
                            <th style={{ width: "20%" }}>소속 매장</th>
                            <th style={{ width: "15%" }}>연락처</th>
                            <th style={{ width: "10%" }}>상태</th>
                            <th style={{ width: "15%", textAlign: "right" }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
                                    검색된 직원이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp, idx) => (
                                <tr key={emp.id}>
                                    <td style={{ color: "#6b7280" }}>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{emp.employeeNumber}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>{emp.department}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                                            <Briefcase size={12} /> {emp.role}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: "inline-block", padding: "0.1rem 0.5rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem",
                                            backgroundColor: emp.brand === "AGRA" ? "#fef08a" : emp.brand === "NOYA" ? "#bfdbfe" : "#e5e7eb",
                                            color: emp.brand === "AGRA" ? "#854d0e" : emp.brand === "NOYA" ? "#1e40af" : "#374151"
                                        }}>
                                            {emp.brand}
                                        </span>
                                        <div style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <MapPin size={12} color="#9ca3af" /> {emp.storeName}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "0.9rem" }}>{emp.phone}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: "inline-block", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.8rem", fontWeight: 500,
                                            backgroundColor: emp.status === "Active" ? "#d1fae5" : emp.status === "On Leave" ? "#fef3c7" : "#fee2e2",
                                            color: emp.status === "Active" ? "#065f46" : emp.status === "On Leave" ? "#92400e" : "#991b1b"
                                        }}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button onClick={() => setSelectedEmployee(emp)} className="btn-hr btn-hr-outline">상세 / 급여 보기</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Employee Details Modal */}
            {selectedEmployee && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", color: "#111827", padding: "2rem", borderRadius: "0.5rem", width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>직원 상세 정보</h3>
                            <button onClick={() => setSelectedEmployee(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Basic Info */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>이름 / 사번</label>
                                    <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{selectedEmployee.name} <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "normal" }}>({selectedEmployee.employeeNumber})</span></div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>소속</label>
                                    <div style={{ fontWeight: 500 }}>{selectedEmployee.brand} - {selectedEmployee.storeName}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>부서 / 직급</label>
                                    <div style={{ fontWeight: 500 }}>{selectedEmployee.department} / {selectedEmployee.role}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>입사일</label>
                                    <div style={{ fontWeight: 500 }}>{selectedEmployee.joinDate}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>연차 현황</label>
                                    <div style={{ fontWeight: 500 }}>총 {selectedEmployee.annualLeaveTotal}일 중 {selectedEmployee.annualLeaveTotal - selectedEmployee.annualLeaveUsed}일 잔여</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>상태</label>
                                    <div style={{ fontWeight: 500, color: selectedEmployee.status === "Active" ? "#059669" : "#dc2626" }}>{selectedEmployee.status}</div>
                                </div>
                            </div>

                            <hr style={{ borderTop: "1px solid #e5e7eb", margin: "0.5rem 0", borderBottom: "none" }} />

                            {/* Salary Info (Only visible to Admin) */}
                            {session.role === "HR Admin" ? (
                                <div>
                                    <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#374151" }}>급여 및 계좌 정보 (HR Admin 전용)</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>기본급 (월)</label>
                                            <div style={{ fontWeight: "bold", color: "#111827", fontSize: "1.1rem" }}>{selectedEmployee.baseSalary.toLocaleString()} 원</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>급여 계좌</label>
                                            <div style={{ fontWeight: 500 }}>{selectedEmployee.bankName} {selectedEmployee.accountNumber}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>신분증 사본 제출</label>
                                            <div style={{ fontWeight: "bold", color: selectedEmployee.idCardUrl ? "#059669" : "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {selectedEmployee.idCardUrl ? (
                                                    <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); alert(`[신분증 사본 열람]\n경로: ${selectedEmployee.idCardUrl}\n\n* 실제 운영 시 보안 뷰어로 열립니다.`); }}>
                                                        제출 완료 (보기)
                                                    </span>
                                                ) : "미제출"}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>통장 사본 제출</label>
                                            <div style={{ fontWeight: "bold", color: selectedEmployee.bankbookUrl ? "#059669" : "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {selectedEmployee.bankbookUrl ? (
                                                    <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); alert(`[통장 사본 열람]\n경로: ${selectedEmployee.bankbookUrl}\n\n* 실제 운영 시 보안 뷰어로 열립니다.`); }}>
                                                        제출 완료 (보기)
                                                    </span>
                                                ) : "미제출"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: "1rem", backgroundColor: "#f3f4f6", borderRadius: "0.5rem", color: "#6b7280", fontSize: "0.85rem", textAlign: "center" }}>
                                    🔒 급여 및 계좌 정보는 인사팀 최고 관리자만 열람할 수 있습니다.
                                </div>
                            )}

                            <hr style={{ borderTop: "1px solid #e5e7eb", margin: "0.5rem 0", borderBottom: "none" }} />

                            {/* Contact Info */}
                            <div>
                                <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#374151" }}>연락처 정보</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>연락처</label>
                                        <div style={{ fontWeight: 500 }}>{selectedEmployee.phone || "-"}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>이메일</label>
                                        <div style={{ fontWeight: 500 }}>{selectedEmployee.email || "-"}</div>
                                    </div>
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>주소</label>
                                        <div style={{ fontWeight: 500 }}>{selectedEmployee.address || "-"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={() => setSelectedEmployee(null)} className="btn-hr btn-hr-primary">닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Create Employee Modal */}
            {showNewEmployeeForm && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", color: "#111827", padding: "2rem", borderRadius: "0.5rem", width: "400px", maxWidth: "90%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>신규 직원 수동 등록</h3>
                            <button onClick={() => setShowNewEmployeeForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>이름 *</label>
                                <input type="text" value={newEmpData.name} onChange={e => setNewEmpData({ ...newEmpData, name: e.target.value })} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>사번 *</label>
                                <input type="text" value={newEmpData.employeeNumber} onChange={e => setNewEmpData({ ...newEmpData, employeeNumber: e.target.value })} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>소속 브랜드</label>
                                <select value={newEmpData.brand} onChange={e => setNewEmpData({ ...newEmpData, brand: e.target.value as Brand })} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }}>
                                    <option value="AGRA">AGRA</option>
                                    <option value="NOYA">NOYA</option>
                                    <option value="HQ">본사 (HQ)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#374151", marginBottom: "0.25rem" }}>매장명</label>
                                <input type="text" value={newEmpData.storeName} onChange={e => setNewEmpData({ ...newEmpData, storeName: e.target.value })} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }} />
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button onClick={() => setShowNewEmployeeForm(false)} className="btn-hr btn-hr-outline">취소</button>
                            <button onClick={handleCreateEmployee} className="btn-hr btn-hr-primary">저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
