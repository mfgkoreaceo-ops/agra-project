"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Shield, Save, Check, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const getDisplayStoreName = (emp: any) => {
    const combined = ((emp.brand || "") + " " + (emp.storeName || "") + " " + (emp.department || "") + " " + (emp.jobTitle || "") + " " + (emp.role || "")).toUpperCase();
    if (combined.includes('NY')) return '노야';
    if (combined.includes('AG')) return '아그라';
    return '본사';
};

export default function PermissionsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Filter and Sort states
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<string>("brand");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hr/permissions");
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedAndFilteredUsers = useMemo(() => {
        let filtered = users || [];
        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            filtered = users.filter(u =>
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.employeeNumber && u.employeeNumber.toLowerCase().includes(q)) ||
                (getDisplayStoreName(u).toLowerCase().includes(q)) ||
                (u.department && u.department.toLowerCase().includes(q))
            );
        }

        return [...filtered].sort((a, b) => {
            let aVal = a[sortField] || "";
            let bVal = b[sortField] || "";

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [users, searchQuery, sortField, sortDirection]);

    const handleToggle = (userId: string, field: string) => {
        setUsers(users.map(u => {
            if (u.id === userId) {
                return { ...u, [field]: !u[field] };
            }
            return u;
        }));
    };

    const hasDefaultPermission = (role: string, type: 'notices' | 'leaves' | 'payroll') => {
        if (type === 'notices') return ["HEAD_OF_MANAGEMENT"].includes(role);
        if (type === 'leaves') return ["HEAD_OF_MANAGEMENT", "HEAD_OF_SALES", "SALES_TEAM_LEADER", "STORE_MANAGER", "HQ_TEAM_LEADER"].includes(role);
        if (type === 'payroll') return false;
        return false;
    };

    const handleSave = async (user: any) => {
        setSavingId(user.id);
        try {
            const res = await fetch("/api/hr/permissions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeNumber: user.employeeNumber,
                    permissions: {
                        canManageNotices: user.canManageNotices,
                        canManageLeaves: user.canManageLeaves,
                        canManagePayroll: user.canManagePayroll
                    }
                })
            });

            if (res.ok) {
                setTimeout(() => setSavingId(null), 1000);
            } else {
                alert("권한 저장에 실패했습니다.");
                setSavingId(null);
            }
        } catch (error) {
            console.error(error);
            setSavingId(null);
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown size={14} color="#9ca3af" style={{ opacity: 0.5 }} />;
        return sortDirection === "asc" ? <ArrowUp size={14} color="#4b5563" /> : <ArrowDown size={14} color="#4b5563" />;
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Shield size={24} color="#3b82f6" /> 권한 부여 설정 (Master 전용)
                </h1>
                <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0", fontSize: "0.95rem" }}>
                    관리 계정이 아닌 특정 사원에게 담당 업무 시스템만 보이도록 추가 접근 권한을 부여합니다. 전체 직원을 검색하거나 정렬할 수 있습니다.
                </p>
            </div>

            {/* Filtering Controls */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                    <Search size={18} color="#9ca3af" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        type="text"
                        placeholder="이름, 사번, 매장명, 부서로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
                    />
                </div>
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th onClick={() => handleSort('employeeNumber')} style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>사번 <SortIcon field="employeeNumber" /></div>
                            </th>
                            <th onClick={() => handleSort('storeName')} style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>매장/소속 <SortIcon field="storeName" /></div>
                            </th>
                            <th onClick={() => handleSort('name')} style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>이름 (직급) <SortIcon field="name" /></div>
                            </th>
                            <th style={{ padding: "1rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, textAlign: "center" }}>공지 관리</th>
                            <th style={{ padding: "1rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, textAlign: "center" }}>연차 결재</th>
                            <th style={{ padding: "1rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, textAlign: "center" }}>급여 관리</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600, textAlign: "right" }}>설정 저장</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : sortedAndFilteredUsers.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>검색 결과가 없습니다.</td></tr>
                        ) : (
                            sortedAndFilteredUsers.map((u) => {
                                const defaultNotices = hasDefaultPermission(u.role, 'notices');
                                const defaultLeaves = hasDefaultPermission(u.role, 'leaves');
                                const defaultPayroll = hasDefaultPermission(u.role, 'payroll');

                                return (
                                    <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: u.brand === 'HQ' ? '#f8fafc' : 'white' }}>
                                        <td style={{ padding: "1rem 1.5rem", fontWeight: 500, color: "#4b5563", fontSize: "0.9rem" }}>{u.employeeNumber}</td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{ fontWeight: 600, color: u.brand === 'HQ' ? "#1e40af" : "#111827" }}>{getDisplayStoreName(u)}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{u.department}</div>
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{ fontWeight: 500, color: "#111827" }}>{u.name}</div>
                                            <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "99px", fontSize: "0.8rem", color: "#4b5563", marginTop: "0.25rem", fontWeight: 500 }}>
                                                {u.jobTitle || u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            {defaultNotices ? (
                                                <span style={{ fontSize: "0.75rem", backgroundColor: "#dbeafe", color: "#1e3a8a", padding: "0.25rem 0.5rem", borderRadius: "99px", fontWeight: 600 }}>기본 권한</span>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={u.canManageNotices}
                                                        onChange={() => handleToggle(u.id, 'canManageNotices')}
                                                        style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                                                    />
                                                    {u.canManageNotices && <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 600 }}>추가됨</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            {defaultLeaves ? (
                                                <span style={{ fontSize: "0.75rem", backgroundColor: "#dbeafe", color: "#1e3a8a", padding: "0.25rem 0.5rem", borderRadius: "99px", fontWeight: 600 }}>기본 권한</span>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={u.canManageLeaves}
                                                        onChange={() => handleToggle(u.id, 'canManageLeaves')}
                                                        style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                                                    />
                                                    {u.canManageLeaves && <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 600 }}>추가됨</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "center" }}>
                                            {defaultPayroll ? (
                                                <span style={{ fontSize: "0.75rem", backgroundColor: "#dbeafe", color: "#1e3a8a", padding: "0.25rem 0.5rem", borderRadius: "99px", fontWeight: 600 }}>기본 권한</span>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={u.canManagePayroll}
                                                        onChange={() => handleToggle(u.id, 'canManagePayroll')}
                                                        style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                                                    />
                                                    {u.canManagePayroll && <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 600 }}>추가됨</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                            {(!defaultNotices || !defaultLeaves || !defaultPayroll) && (
                                                <button
                                                    onClick={() => handleSave(u)}
                                                    disabled={savingId === u.id}
                                                    style={{
                                                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                                        padding: "0.5rem 1rem", backgroundColor: savingId === u.id ? "#10b981" : "#1f2937",
                                                        color: "white", border: "none", borderRadius: "0.5rem",
                                                        fontWeight: 600, cursor: savingId === u.id ? "default" : "pointer",
                                                        transition: "all 0.2s"
                                                    }}
                                                >
                                                    {savingId === u.id ? <Check size={16} /> : <Save size={16} />}
                                                    {savingId === u.id ? "저장됨" : "저장"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", display: "flex", gap: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", color: "#334155" }}>📊 권한 구분 안내</h3>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                        <li><strong style={{ color: "#1e3a8a", backgroundColor: "#dbeafe", padding: "0.1rem 0.3rem", borderRadius: "4px" }}>기본 권한</strong> : 해당 직급(팀장, 점장 등)에게 기본적으로 부여된 관리 권한입니다. (수정 불가)</li>
                        <li><strong style={{ color: "#2563eb" }}>체크박스</strong> : 기본 권한이 없는 일반/실무 직원에게 예외적으로 특정 메뉴 접근 권한을 추가 부여할 때 사용합니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
