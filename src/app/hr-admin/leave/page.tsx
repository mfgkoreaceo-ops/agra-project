"use client";

import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useHR, Employee, LeaveRecord } from "../HRContext";
import { Calendar, Search, CheckCircle, XCircle } from "lucide-react";

export default function LeaveAdmin() {
    const { session } = useAuth();
    const { hrState, updateHRState } = useHR();
    const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState<Employee | null>(null);

    if (!session) return null;

    // Filter pending leaves based on hierarchy
    const pendingApprovals = hrState.leaveRecords
        .filter(record => record.status === "Pending")
        .map(record => ({
            record,
            employee: hrState.employees.find(e => e.id === record.employeeId)!
        }))
        .filter(({ employee }) => {
            if (!employee) return false;
            if (session.role === "Store Manager") {
                // Store Manager approves their store staff (except themselves)
                return employee.storeId === session.storeId && employee.role !== "Store Manager";
            }
            if (session.role === "Area Manager") {
                // Area Manager approves Store Managers
                return employee.role === "Store Manager";
            }
            if (session.role === "HR Admin") {
                // HR Admin approves Area Managers (and maybe Store Managers if an Area Manager is missing, but keeping strict for now)
                return employee.role === "Area Manager";
            }
            return false; // Others cannot approve
        });

    const handleApprove = (leaveId: string, employeeId: string, daysUsed: number) => {
        const updatedLeaves = hrState.leaveRecords.map(r => r.id === leaveId ? { ...r, status: "Approved" as const } : r);
        const updatedEmployees = hrState.employees.map(e => e.id === employeeId ? { ...e, annualLeaveUsed: e.annualLeaveUsed + daysUsed } : e);

        updateHRState({ leaveRecords: updatedLeaves, employees: updatedEmployees });
        alert("휴가가 승인되었습니다.");
    };

    const handleReject = (leaveId: string) => {
        const updatedLeaves = hrState.leaveRecords.map(r => r.id === leaveId ? { ...r, status: "Rejected" as const } : r);
        updateHRState({ leaveRecords: updatedLeaves });
        alert("휴가 신청이 반려되었습니다.");
    };

    const visibleEmployees = hrState.employees.filter(emp => {
        if (session.role === "HR Admin") return true; // Sees everyone
        if (session.role === "Area Manager") return emp.brand === session.brand; // Sees their own brand/area
        if (session.role === "Store Manager" || session.role === "Assistant Manager") return emp.storeId === session.storeId; // Sees only their store
        return emp.id === session.uid; // Fallback
    });

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>연차 관리 (Leave Management)</h2>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>직원별 발생 연차 및 사용 내역 조회</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                        <input
                            type="text"
                            placeholder="직원 검색..."
                            style={{ padding: "0.5rem 1rem 0.5rem 2.25rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.9rem" }}
                        />
                    </div>
                </div>
            </div>

            {/* Hierarchical Approval Section */}
            <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>결재 대기함 (승인 필요)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    {pendingApprovals.length === 0 ? (
                        <div style={{ background: "white", padding: "3rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", textAlign: "center", color: "#9ca3af" }}>
                            <Calendar size={32} style={{ margin: "0 auto 0.5rem auto", opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: "0.9rem" }}>승인 대기 중인 휴가 요청이 없습니다.</p>
                        </div>
                    ) : (
                        pendingApprovals.map(({ record, employee }) => (
                            <div key={record.id} style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#111827" }}>{employee.name} ({employee.employeeNumber})</h4>
                                        <span style={{ fontSize: "0.8rem", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "0.1rem 0.4rem", borderRadius: "99px" }}>{employee.storeName} / {employee.role}</span>
                                    </div>
                                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", color: "#374151" }}><strong>일정:</strong> {record.startDate} ~ {record.endDate} ({record.daysUsed}일)</p>
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}><strong>사유:</strong> {record.reason} <span style={{ marginLeft: "1rem", color: "#9ca3af", fontSize: "0.8rem" }}>신청일: {record.requestDate}</span></p>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button onClick={() => handleReject(record.id)} className="btn-hr btn-hr-outline" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}>
                                        <XCircle size={16} /> 반려
                                    </button>
                                    <button onClick={() => handleApprove(record.id, employee.id, record.daysUsed)} className="btn-hr btn-hr-primary" style={{ display: "flex", alignItems: "center", gap: "0.25rem", backgroundColor: "#10b981", borderColor: "#10b981" }}>
                                        <CheckCircle size={16} /> 승인
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ background: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: "20%" }}>직원 정보</th>
                            <th style={{ width: "15%" }}>소속</th>
                            <th style={{ width: "15%", textAlign: "center" }}>입사일</th>
                            <th style={{ width: "15%", textAlign: "center" }}>총 발생 연차</th>
                            <th style={{ width: "15%", textAlign: "center" }}>사용 연차</th>
                            <th style={{ width: "15%", textAlign: "center" }}>잔여 연차</th>
                            <th style={{ width: "5%" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleEmployees.map((emp) => {
                            const remaining = emp.annualLeaveTotal - emp.annualLeaveUsed;
                            return (
                                <tr key={emp.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{emp.employeeNumber}</div>
                                    </td>
                                    <td>
                                        <div>{emp.brand}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{emp.storeName}</div>
                                    </td>
                                    <td style={{ textAlign: "center", color: "#4b5563", fontSize: "0.9rem" }}>
                                        {emp.joinDate}
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: 600, color: "#1f2937" }}>
                                        {emp.annualLeaveTotal}일
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: 600, color: "#dc2626" }}>
                                        {emp.annualLeaveUsed}일
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: "bold", color: remaining < 3 ? "#dc2626" : "#059669", fontSize: "1.1rem" }}>
                                        {remaining}일
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <button onClick={() => setSelectedEmployeeHistory(emp)} className="btn-hr btn-hr-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>내역</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "2rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>최근 처리 내역</h3>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                    <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
                        <Calendar size={32} style={{ margin: "0 auto 0.5rem auto", opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>최근 승인된 휴가 내역이 없습니다.</p>
                    </div>
                </div>
            </div>

            {/* Employee Leave History Modal */}
            {selectedEmployeeHistory && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", color: "#111827", padding: "2rem", borderRadius: "0.5rem", width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>{selectedEmployeeHistory.name}님 연차 상세 내역</h3>
                            <button onClick={() => setSelectedEmployeeHistory(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f3f4f6", borderRadius: "0.5rem", display: "flex", gap: "2rem" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>총 발생 연차</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: "bold" }}>{selectedEmployeeHistory.annualLeaveTotal}일</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>총 사용 일정</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: "bold", color: "#dc2626" }}>{selectedEmployeeHistory.annualLeaveUsed}일</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>현재 잔여 일정</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: "bold", color: "#059669" }}>{selectedEmployeeHistory.annualLeaveTotal - selectedEmployeeHistory.annualLeaveUsed}일</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {hrState.leaveRecords.filter(r => r.employeeId === selectedEmployeeHistory.id).length === 0 ? (
                                <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", border: "1px dashed #d1d5db", borderRadius: "0.5rem" }}>
                                    휴가 신청 및 사용 내역이 없습니다.
                                </div>
                            ) : (
                                hrState.leaveRecords
                                    .filter(r => r.employeeId === selectedEmployeeHistory.id)
                                    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                                    .map(record => (
                                        <div key={record.id} style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{record.startDate} ~ {record.endDate} <span style={{ color: "#6b7280", fontSize: "0.85rem", fontWeight: "normal" }}>({record.daysUsed}일)</span></div>
                                                <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>사유: {record.reason}</div>
                                                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>신청일: {record.requestDate}</div>
                                            </div>
                                            <span style={{
                                                padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.8rem", fontWeight: 600,
                                                backgroundColor: record.status === "Approved" ? "#d1fae5" : record.status === "Rejected" ? "#fee2e2" : "#fef3c7",
                                                color: record.status === "Approved" ? "#065f46" : record.status === "Rejected" ? "#991b1b" : "#92400e"
                                            }}>
                                                {record.status === "Approved" ? "승인됨" : record.status === "Rejected" ? "반려됨" : "결재 대기"}
                                            </span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
