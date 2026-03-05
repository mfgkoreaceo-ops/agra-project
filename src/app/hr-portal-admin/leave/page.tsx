"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Search } from "lucide-react";

type LeaveRequest = {
    id: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    reason: string;
    leaveType?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    employee: {
        name: string;
        employeeNumber: string;
        storeName: string;
        department: string;
    }
};

export default function LeavePage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLeaveRequests = async () => {
        try {
            const storedUser = localStorage.getItem("hr_user");
            if (!storedUser) return;
            const user = JSON.parse(storedUser);

            const res = await fetch(`/api/hr/leave?requesterId=${user.employeeNumber}`);
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load leave requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
        if (!confirm(`이 연차 신청을 ${status === 'APPROVED' ? '승인' : '반려'} 하시겠습니까?`)) return;

        try {
            const res = await fetch("/api/hr/leave", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                alert("상태가 업데이트 되었습니다.");
                fetchLeaveRequests();
            } else {
                alert("업데이트에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버 연결 오류");
        }
    };

    const filteredRequests = requests.filter(req =>
        req.employee?.name.includes(searchTerm) ||
        req.employee?.storeName.includes(searchTerm) ||
        req.status.includes(searchTerm.toUpperCase())
    );

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>연차 및 근태 이력 조회</h1>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                    결재 대기 중인 연차 처리 및 전사 임직원 휴가 내역
                </p>
            </div>

            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                    <input
                        type="text"
                        placeholder="이름, 매장명 검색 또는 PENDING/APPROVED 검색"
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
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>신청일</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>사번/이름</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>휴가 기간</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>사유</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#4b5563" }}>상태</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#4b5563" }}>결재 (관리자)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>연차 신청 내역이 없습니다. (시드 데이터 또는 앱을 통해 추가 필요)</td></tr>
                        ) : (
                            filteredRequests.map(req => (
                                <tr key={req.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "1rem", color: "#4b5563", fontSize: "0.9rem" }}>
                                        {new Date(req.startDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontWeight: 500, color: "#111827" }}>{req.employee?.name} <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 400 }}>{req.employee?.department}</span></div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{req.employee?.employeeNumber} - {req.employee?.storeName}</div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ color: "#111827", fontSize: "0.9rem", fontWeight: 500 }}>
                                            {new Date(req.startDate).toLocaleDateString()} ~ {new Date(req.endDate).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600, marginTop: "0.25rem" }}>
                                            총 {req.daysRequested}일 차감
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem", color: "#4b5563", fontSize: "0.9rem", maxWidth: "200px" }}>
                                        <div style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "0.25rem", fontSize: "0.75rem", marginBottom: "0.25rem", fontWeight: 600 }}>
                                            {req.leaveType || 'ANNUAL'}
                                        </div><br/>
                                        {req.reason}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {req.status === 'PENDING' ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <Clock size={12} /> 결재 대기
                                            </span>
                                        ) : req.status === 'APPROVED' ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", backgroundColor: "#dcfce7", color: "#16a34a", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <CheckCircle size={12} /> 승인됨
                                            </span>
                                        ) : (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <XCircle size={12} /> 반려됨
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        {req.status === 'PENDING' ? (
                                            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                                                    style={{ padding: "0.35rem 0.75rem", backgroundColor: "#1e3a8a", color: "white", border: "none", borderRadius: "0.25rem", fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}
                                                >승인</button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                                                    style={{ padding: "0.35rem 0.75rem", backgroundColor: "white", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "0.25rem", fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}
                                                >반려</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>처리 완료</span>
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
