"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FileSignature, Search, Filter, CheckCircle, XCircle } from "lucide-react";

export default function ResignationAdminPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchRecords = async () => {
        try {
            const storedUser = localStorage.getItem("hr_user");
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }

            const res = await fetch("/api/hr/resignations");
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
        const action = status === "APPROVED" ? "수리(승인)" : "반려";
        if (!confirm(`해당 사직서를 ${action} 처리하시겠습니까?\n(*수리 시 해당 직원은 실시간으로 '퇴사' 상태로 전환됩니다)`)) return;

        setIsUpdating(true);
        try {
            const res = await fetch("/api/hr/resignations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                alert(`사직서가 성공적으로 ${action} 처리되었습니다.`);
                fetchRecords();
                setSelectedRecord(null);
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error(error);
            alert("처리 중 오류가 발생했습니다.");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredRecords = useMemo(() => {
        return records.filter(r =>
            r.employee.name.includes(searchQuery) ||
            r.employee.employeeNumber.includes(searchQuery) ||
            r.employee.storeName.includes(searchQuery)
        );
    }, [records, searchQuery]);

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>사직서 수리 및 관리</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        임직원의 사직서 제출 내역을 확인하고 수리/반려 처리합니다.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ position: "relative" }}>
                        <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                        <input
                            type="text"
                            placeholder="이름, 사번, 매장 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: "0.6rem 1rem 0.6rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.9rem", width: "250px", outline: "none" }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>제출일자</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>사번</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>이름 (직급)</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>소속 / 매장</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>퇴사 희망일</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>진행 상태</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>전자문서 열람</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>}
                        {!loading && filteredRecords.length === 0 && (
                            <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>제출된 사직서 내역이 없습니다.</td></tr>
                        )}
                        {filteredRecords.map(r => (
                            <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>{r.employee.employeeNumber}</td>
                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#111827" }}>
                                    {r.employee.name} <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>({r.employee.role})</span>
                                </td>
                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                                    {r.employee.brand} / {r.employee.storeName}
                                </td>
                                <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.9rem", color: "#111827", fontWeight: 600 }}>
                                    {new Date(r.resignationDate).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "1rem", textAlign: "center" }}>
                                    {r.status === "PENDING" && <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>결재 대기</span>}
                                    {r.status === "PENDING_MGMT_HEAD" && <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#e0e7ff", color: "#4f46e5", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>1차 결재 대기</span>}
                                    {r.status === "PENDING_CEO" && <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#fae8ff", color: "#c026d3", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>최종 결재 대기</span>}
                                    {r.status === "APPROVED" && <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#d1fae5", color: "#059669", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>수리 완료 (퇴사)</span>}
                                    {r.status === "REJECTED" && <span style={{ padding: "0.3rem 0.75rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>반려됨</span>}
                                </td>
                                <td style={{ padding: "1rem", textAlign: "center" }}>
                                    <button
                                        onClick={() => setSelectedRecord(r)}
                                        style={{ padding: "0.4rem 0.75rem", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                                    >
                                        <FileSignature size={14} /> 문서 상세 보기
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Document Verification Modal */}
            {selectedRecord && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", padding: "2.5rem", borderRadius: "1rem", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}><FileSignature /> 사직서 (전자 문서)</h2>
                            <button onClick={() => setSelectedRecord(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}>&times;</button>
                        </div>

                        <div style={{ border: "2px solid #111827", padding: "3rem", borderRadius: "0.5rem", backgroundColor: "#fff", position: "relative" }}>
                            {/* Watermark */}
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-30deg)", fontSize: "6rem", fontWeight: "bold", color: "rgba(0,0,0,0.03)", pointerEvents: "none", whiteSpace: "nowrap" }}>
                                AGRA HR SECURE
                            </div>

                            <h1 style={{ textAlign: "center", fontSize: "2rem", letterSpacing: "0.5rem", margin: "0 0 3rem 0", color: "#111827" }}>사 직 서</h1>

                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "3rem" }}>
                                <tbody>
                                    <tr>
                                        <th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", width: "25%", textAlign: "left", color: "#374151" }}>소속 매장/부서</th>
                                        <td style={{ border: "1px solid #d1d5db", padding: "1rem", color: "#111827" }}>{selectedRecord.employee.brand} / {selectedRecord.employee.storeName} ({selectedRecord.employee.department})</td>
                                    </tr>
                                    <tr>
                                        <th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>직급 및 성명</th>
                                        <td style={{ border: "1px solid #d1d5db", padding: "1rem", color: "#111827" }}>{selectedRecord.employee.role} / {selectedRecord.employee.name}</td>
                                    </tr>
                                    <tr>
                                        <th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>퇴사 희망일자</th>
                                        <td style={{ border: "1px solid #d1d5db", padding: "1rem", color: "#111827", fontWeight: "bold" }}>{new Date(selectedRecord.resignationDate).toLocaleDateString()}</td>
                                    </tr>
                                    <tr>
                                        <th style={{ border: "1px solid #d1d5db", padding: "1rem", backgroundColor: "#f9fafb", textAlign: "left", color: "#374151" }}>퇴사 사유</th>
                                        <td style={{ border: "1px solid #d1d5db", padding: "1rem", color: "#111827", whiteSpace: "pre-wrap" }}>{selectedRecord.reason}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <p style={{ textAlign: "center", fontSize: "1.1rem", margin: "0 0 2rem 0", color: "#374151", lineHeight: 1.6 }}>
                                본인은 위와 같은 사유로 인하여 <br />사직서를 제출하오니 수리하여 주시기 바랍니다.
                            </p>

                            <div style={{ textAlign: "center", marginBottom: "3rem", color: "#111827" }}>
                                {new Date(selectedRecord.createdAt).getFullYear()}년{' '}
                                {new Date(selectedRecord.createdAt).getMonth() + 1}월{' '}
                                {new Date(selectedRecord.createdAt).getDate()}일
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: "1rem" }}>
                                <p style={{ fontSize: "1.1rem", color: "#111827", margin: 0 }}>제출자 (전자서명):</p>
                                <div style={{ borderBottom: "1px solid #111827", width: "200px", height: "80px", position: "relative" }}>
                                    <img src={selectedRecord.signatureData} alt="전자서명" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }} />
                                </div>
                            </div>
                        </div>

                        {(selectedRecord.status === "PENDING" ||
                            (selectedRecord.status === "PENDING_MGMT_HEAD" && currentUser?.role === "HEAD_OF_MANAGEMENT") ||
                            (selectedRecord.status === "PENDING_CEO" && currentUser?.jobTitle === "대표이사 (CEO)")
                        ) ? (
                            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                                <button
                                    onClick={() => handleUpdateStatus(selectedRecord.id, "REJECTED")}
                                    disabled={isUpdating}
                                    style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "1rem", backgroundColor: "white", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
                                >
                                    <XCircle /> 반려 처리
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedRecord.id, "APPROVED")}
                                    disabled={isUpdating}
                                    style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "1rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
                                >
                                    <CheckCircle /> {selectedRecord.status === 'PENDING_MGMT_HEAD' ? '1차 승인 처리' : '최종 수리 및 퇴사 처리'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f3f4f6", borderRadius: "0.5rem", textAlign: "center", color: "#4b5563", fontWeight: 500 }}>
                                {["APPROVED", "REJECTED"].includes(selectedRecord.status)
                                    ? `이미 ${selectedRecord.status === "APPROVED" ? "수리(퇴사)" : "반려"} 완료된 결재건입니다.`
                                    : "현재 대기 중인 다른 결재 단계가 있거나, 처리 권한이 없습니다."}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
