"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, Plus, Trash2, Edit } from "lucide-react";

export default function LeavePolicyAdminPage() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    
    // For new policy
    const [isAdding, setIsAdding] = useState(false);
    const [newPolicy, setNewPolicy] = useState({ type: "", name: "", description: "", defaultDays: 0, isPaid: true });

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hr/leave-policy");
            if (res.ok) {
                const data = await res.json();
                setPolicies(data.policies || []);
            }
        } catch (error) {
            console.error("Failed to load policies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (policy: any) => {
        setEditingId(policy.id);
        setEditForm({ ...policy });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch("/api/hr/leave-policy", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                alert("휴가 규정이 수정되었습니다.");
                setEditingId(null);
                fetchPolicies();
            } else {
                const err = await res.json();
                alert(`오류: ${err.error}`);
            }
        } catch (error) {
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    const handleSaveNew = async () => {
        if (!newPolicy.type || !newPolicy.name) {
            alert("식별자(Type)와 규정명은 필수입니다.");
            return;
        }
        try {
            const res = await fetch("/api/hr/leave-policy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPolicy)
            });
            if (res.ok) {
                alert("새 휴가 규정이 추가되었습니다.");
                setIsAdding(false);
                setNewPolicy({ type: "", name: "", description: "", defaultDays: 0, isPaid: true });
                fetchPolicies();
            } else {
                const err = await res.json();
                alert(`오류: ${err.error}`);
            }
        } catch (error) {
            alert("추가 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>휴가 규정 관리</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        경조 휴가, 무급 휴가 등 회사 내 휴가 규정을 동적으로 관리합니다.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#3b82f6", color: "white", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: 500 }}
                >
                    <Plus size={16} /> 새 규정 추가
                </button>
            </div>

            {isAdding && (
                <div style={{ backgroundColor: "#f0fdf4", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #16a34a", marginBottom: "1.5rem" }}>
                    <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#166534" }}>새 휴가 추가</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#166534", marginBottom: "0.5rem" }}>식별 코드 (영문)</label>
                            <input type="text" placeholder="예: SICK_LEAVE" value={newPolicy.type} onChange={e => setNewPolicy({...newPolicy, type: e.target.value})} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#166534", marginBottom: "0.5rem" }}>표시 규정명</label>
                            <input type="text" placeholder="예: 병가" value={newPolicy.name} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#166534", marginBottom: "0.5rem" }}>기본 제공 일수</label>
                            <input type="number" value={newPolicy.defaultDays} onChange={e => setNewPolicy({...newPolicy, defaultDays: parseFloat(e.target.value)})} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "#166534", marginBottom: "0.5rem" }}>상세 설명</label>
                            <input type="text" placeholder="질병 등으로 인한 병가" value={newPolicy.description} onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }} />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#15803d", fontSize: "0.9rem" }}>
                                <input type="checkbox" checked={newPolicy.isPaid} onChange={e => setNewPolicy({...newPolicy, isPaid: e.target.checked})} />
                                유급 휴가여부
                            </label>
                        </div>
                        <button onClick={handleSaveNew} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#16a34a", color: "white", borderRadius: "0.5rem", border: "none", cursor: "pointer", marginTop: "1.5rem" }}>추가하기</button>
                    </div>
                </div>
            )}

            <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>코드/이름</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>설명</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>유/무급</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>기본 발생일</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>사용 상태</th>
                            <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280" }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : policies.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>등록된 휴가 규정이 없습니다.</td></tr>
                        ) : policies.map((policy) => (
                            <tr key={policy.id} style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: editingId === policy.id ? "#f8fafc" : "white" }}>
                                {editingId === policy.id ? (
                                    <>
                                        <td style={{ padding: "1rem" }}>
                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{policy.type}</div>
                                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ padding: "0.5rem", width: "100%", marginTop: "0.25rem" }} />
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <input type="text" value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ padding: "0.5rem", width: "100%" }} />
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            <input type="checkbox" checked={editForm.isPaid} onChange={e => setEditForm({...editForm, isPaid: e.target.checked})} />
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            <input type="number" value={editForm.defaultDays} onChange={e => setEditForm({...editForm, defaultDays: e.target.value})} style={{ padding: "0.5rem", width: "60px", textAlign: "center" }} />
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            <select value={editForm.isActive ? "true" : "false"} onChange={e => setEditForm({...editForm, isActive: e.target.value === "true"})} style={{ padding: "0.5rem" }}>
                                                <option value="true">활성화</option>
                                                <option value="false">비활성화</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            <button onClick={handleSaveEdit} style={{ padding: "0.4rem 0.75rem", backgroundColor: "#10b981", color: "white", borderRadius: "0.25rem", border: "none", cursor: "pointer", marginRight: "0.5rem" }}>저장</button>
                                            <button onClick={handleCancelEdit} style={{ padding: "0.4rem 0.75rem", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "0.25rem", border: "1px solid #d1d5db", cursor: "pointer" }}>취소</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ padding: "1rem", color: "#111827", fontWeight: 500 }}>
                                            <div style={{ fontSize: "0.75rem", color: "#9ca3af", letterSpacing: "0.05em" }}>{policy.type}</div>
                                            {policy.name}
                                        </td>
                                        <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>{policy.description || "-"}</td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            {policy.isPaid ? (
                                                <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.8rem", fontWeight: 500 }}>유급</span>
                                            ) : (
                                                <span style={{ backgroundColor: "#f3f4f6", color: "#6b7280", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.8rem", fontWeight: 500 }}>무급</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold", color: "#111827" }}>{policy.defaultDays}일</td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            {policy.isActive ? (
                                                <span style={{ color: "#3b82f6", fontSize: "0.85rem", fontWeight: 500 }}>활성</span>
                                            ) : (
                                                <span style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 }}>비활성</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            <button onClick={() => handleEditClick(policy)} style={{ padding: "0.4rem", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#3b82f6" }}>
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
