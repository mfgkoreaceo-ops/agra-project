"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Search, CalendarPlus } from "lucide-react";

type LeaveRequest = {
    id: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    reason: string;
    rejectionReason?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function LeaveSelfPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [balance, setBalance] = useState({ totalDays: 15, usedDays: 0 });
    const [policies, setPolicies] = useState<any[]>([]);

    // Form states
    const [selectedLeaveType, setSelectedLeaveType] = useState("ANNUAL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [daysRequested, setDaysRequested] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLeaveRequests = async (user: any) => {
        try {
            const res = await fetch(`/api/hr/leave?requesterId=${user.employeeNumber}&view=self`);
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);

            const balRes = await fetch(`/api/hr/leave/balance?employeeNumber=${user.employeeNumber}`);
            if (balRes.ok) {
                const balData = await balRes.json();
                setBalance({ totalDays: balData.totalDays, usedDays: balData.usedDays });
            }

            const polRes = await fetch("/api/hr/leave-policy");
            if (polRes.ok) {
                const polData = await polRes.json();
                if (polData.policies) {
                    setPolicies(polData.policies.filter((p: any) => p.isActive));
                }
            }
        } catch (error) {
            console.error("Failed to load leave data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            fetchLeaveRequests(user);
        }
    }, []);

    // 휴가 시작일/종료일 기간을 입력하면 자동으로 주말/공휴일 제외 후 영업일 단위로 갱신 (API 통신)
    useEffect(() => {
        if (startDate && endDate) {
            const fetchWorkingDays = async () => {
                try {
                    const res = await fetch(`/api/hr/leave/working-days?start=${startDate}&end=${endDate}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.workingDays !== undefined && data.workingDays > 0) {
                            setDaysRequested(data.workingDays);
                        } else if (data.workingDays === 0) {
                            setDaysRequested(0);
                        }
                    }
                } catch (error) {
                    console.error("Failed to calculate working days:", error);
                }
            };
            fetchWorkingDays();
        }
    }, [startDate, endDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/hr/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeNumber: currentUser.employeeNumber,
                    startDate,
                    endDate,
                    daysRequested,
                    reason,
                    leaveType: selectedLeaveType
                })
            });

            if (res.ok) {
                alert("연차 신청이 완료되었습니다.");
                setStartDate("");
                setEndDate("");
                setReason("");
                setDaysRequested(1);
                fetchLeaveRequests(currentUser);
            } else {
                const err = await res.json();
                alert("연차 신청에 실패했습니다: " + (err.error || ""));
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.reason.includes(searchTerm) ||
        req.status.includes(searchTerm.toUpperCase())
    );

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <style jsx>{`
                .leave-grid-main {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                }
                .leave-grid-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .leave-radio-group {
                    display: flex;
                    gap: 1rem;
                }
                
                @media (max-width: 1024px) {
                    .leave-grid-main {
                        grid-template-columns: 1fr;
                    }
                    .leave-grid-cards {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                @media (max-width: 640px) {
                    .leave-grid-cards {
                        grid-template-columns: 1fr;
                    }
                    .leave-radio-group {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
            `}</style>

            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>나의 연차 및 휴가</h1>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                    나의 연차 신청 내역 및 새로운 휴가 기안서 작성
                </p>
            </div>

            <div className="leave-grid-main">
                {/* Form Column */}
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", height: "fit-content" }}>
                    <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem", color: "#111827" }}>
                        <CalendarPlus size={20} /> 새 휴가 신청
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>시작일</label>
                            <input
                                type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>종료일</label>
                            <input
                                type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>휴가 분류 (규정)</label>
                            <select
                                value={selectedLeaveType}
                                onChange={(e) => setSelectedLeaveType(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", backgroundColor: "white" }}
                            >
                                {policies.map(p => (
                                    <option key={p.id} value={p.type}>{p.name} {p.isPaid ? '(유급)' : '(무급)'} - 기본 {p.defaultDays}일</option>
                                ))}
                                {policies.length === 0 && (
                                    <option value="ANNUAL">연차 (기본)</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>신청 연차 상세 유형</label>
                            <div className="leave-radio-group">
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#374151" }}>
                                    <input type="radio" name="leaveType" value={1} checked={daysRequested === 1} onChange={() => setDaysRequested(1)} /> 연차
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#374151" }}>
                                    <input type="radio" name="leaveType" value={0.5} checked={daysRequested === 0.5} onChange={() => setDaysRequested(0.5)} /> 반차 (0.5일)
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#374151" }}>
                                    <input type="radio" name="leaveType" value={0.25} checked={daysRequested === 0.25} onChange={() => setDaysRequested(0.25)} /> 반반차 (0.25일)
                                </label>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>신청 일수 확인 (직접 수정 가능)</label>
                            <input
                                type="number" min="0.25" step="0.25" required value={daysRequested} onChange={e => setDaysRequested(parseFloat(e.target.value))}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#4b5563", marginBottom: "0.5rem" }}>신청 사유</label>
                            <textarea
                                required rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="예: 개인 사정, 연차 소진 등"
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", resize: "none" }}
                            />
                        </div>
                        <button
                            type="submit" disabled={isSubmitting}
                            style={{ padding: "0.75rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", marginTop: "0.5rem" }}
                        >
                            {isSubmitting ? "결재 상신 중..." : "결재 상신하기"}
                        </button>
                    </form>
                </div>

                {/* List Column */}
                <div style={{ display: "flex", flexDirection: "column" }}>

                    {/* Balance Cards */}
                    <div className="leave-grid-cards">
                        <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500, marginBottom: "0.25rem" }}>이번 연도 총 연차</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{balance.totalDays}일</span>
                        </div>
                        <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500, marginBottom: "0.25rem" }}>사용 완료 연차</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ef4444" }}>{balance.usedDays}일</span>
                        </div>
                        <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500, marginBottom: "0.25rem" }}>사용 가능 잔여 연차</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>{balance.totalDays - balance.usedDays}일</span>
                        </div>
                    </div>

                    <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "1rem", display: "flex", gap: "1rem" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                            <input
                                type="text"
                                placeholder="사유, 또는 PENDING/APPROVED 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                <tr>
                                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>기안일</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>기간 및 일수</th>
                                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", color: "#4b5563" }}>사유</th>
                                    <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", color: "#4b5563" }}>결재 상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>나의 연차/휴가 내역이 없습니다.</td></tr>
                                ) : (
                                    filteredRequests.map(req => (
                                        <tr key={req.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "1rem", color: "#4b5563", fontSize: "0.9rem" }}>
                                                {new Date(req.startDate).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <div style={{ color: "#111827", fontSize: "0.9rem", fontWeight: 500 }}>
                                                    {new Date(req.startDate).toLocaleDateString()} ~ {new Date(req.endDate).toLocaleDateString()}
                                                </div>
                                                <div style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600, marginTop: "0.25rem" }}>
                                                    총 {req.daysRequested}일 차감
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem", color: "#4b5563", fontSize: "0.9rem" }}>
                                                <div style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "0.25rem", fontSize: "0.75rem", marginBottom: "0.25rem", fontWeight: 600 }}>
                                                    {(req as any).leaveType || 'ANNUAL'}
                                                </div><br />
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
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem" }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                            <XCircle size={12} /> 반려됨
                                                        </span>
                                                        {req.rejectionReason && (
                                                            <span style={{ fontSize: "0.7rem", color: "#dc2626", backgroundColor: "#fef2f2", padding: "0.2rem 0.4rem", borderRadius: "0.25rem", border: "1px solid #fecaca", maxWidth: "120px", wordBreak: "keep-all" }}>
                                                                {req.rejectionReason}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
