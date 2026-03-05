"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, CalendarDays, DollarSign, LogOut, LayoutDashboard, KeyRound } from "lucide-react";
import { HRProvider, EmployeeRole } from "./HRContext";
import { AuthProvider, useAuth } from "./AuthContext";
import HRChatbotWidget from "./chatbot/HRChatbotWidget";
function HRLayoutContent({ children }: { children: React.ReactNode }) {
    const { session, logout, isLoaded, login } = useAuth();
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    if (!isLoaded) return <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }} />;

    // ----------------- LOGIN VIEW -----------------
    if (!session) {
        const handleLogin = (e: React.FormEvent) => {
            e.preventDefault();
            const success = login(employeeNumber, password);
            if (!success) setErrorMsg("사번 또는 비밀번호(1234)가 올바르지 않습니다.");
        };

        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
                <div style={{ backgroundColor: "white", padding: "3rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "420px" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{ display: "inline-flex", padding: "1rem", backgroundColor: "#f3f4f6", borderRadius: "50%", marginBottom: "1rem" }}>
                            <KeyRound size={32} color="#4b5563" />
                        </div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>HR Admin (직원 전용)</h1>
                        <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>아그라/노야 사내 포털에 로그인하세요.</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>사번 (Employee ID)</label>
                            <input
                                type="text"
                                placeholder="예: AG-2024-001"
                                value={employeeNumber}
                                onChange={(e) => setEmployeeNumber(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "1rem" }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>비밀번호</label>
                            <input
                                type="password"
                                placeholder="숫자 4자리 입력 (MVP: 1234)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "1rem" }}
                                required
                            />
                        </div>
                        {errorMsg && <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>{errorMsg}</p>}
                        <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#1f2937", color: "white", borderRadius: "0.375rem", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "0.5rem", transition: "background 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#111827"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1f2937"}>
                            로그인
                        </button>
                    </form>
                    <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                        <Link href="/" style={{ color: "#4f46e5", fontSize: "0.875rem", textDecoration: "none", fontWeight: 500 }}>← 홈페이지로 귀환</Link>
                        <div style={{ marginTop: "1rem" }}>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("agra_hr_db_secure");
                                    window.location.reload();
                                }}
                                style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                            >
                                🛠 DB 초기화 (새로운 계정 로드용)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------- RBAC LOGIC -----------------
    const isAdmin = session.role === "HR Admin";
    const isManager = session.role === "Store Manager" || session.role === "Assistant Manager" || session.role === "Area Manager";

    // ----------------- SECURE VIEW -----------------
    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: "'Inter', sans-serif" }}>

            {/* Navigation Sidebar */}
            <aside style={{ width: "260px", backgroundColor: "#1f2937", color: "white", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid #374151" }}>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0, letterSpacing: "0.05em" }}>AGRA/NOYA</h1>
                    <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "0.25rem" }}>HR Admin System</p>
                </div>

                <div style={{ padding: "1.5rem 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{session.name} 님</div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{session.brand} | {session.role}</div>
                </div>

                <nav style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Link href="/hr-admin/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "0.375rem", color: "#d1d5db", textDecoration: "none", transition: "all 0.2s" }} className="hr-nav-link">
                        <LayoutDashboard size={20} />
                        <span>My 대시보드</span>
                    </Link>

                    {(isAdmin || isManager) && (
                        <Link href="/hr-admin" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "0.375rem", color: "#d1d5db", textDecoration: "none", transition: "all 0.2s" }} className="hr-nav-link">
                            <Users size={20} />
                            <span>{isAdmin ? "전체 직원 명부" : "매장 직원 목록"}</span>
                        </Link>
                    )}

                    {/* Leave Management needed for managers to approve pending requests */}
                    {(isAdmin || isManager) && (
                        <Link href="/hr-admin/leave" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "0.375rem", color: "#d1d5db", textDecoration: "none", transition: "all 0.2s" }} className="hr-nav-link">
                            <CalendarDays size={20} />
                            <span>연차 관리 (Leave)</span>
                        </Link>
                    )}

                    {isAdmin && (
                        <Link href="/hr-admin/payroll" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "0.375rem", color: "#d1d5db", textDecoration: "none", transition: "all 0.2s" }} className="hr-nav-link">
                            <DollarSign size={20} />
                            <span>급여 관리 (Payroll)</span>
                        </Link>
                    )}
                </nav>

                <div style={{ padding: "1.5rem", borderTop: "1px solid #374151", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#9ca3af", textDecoration: "none", fontSize: "0.9rem" }}>
                        <LogOut size={18} />
                        <span>홈페이지로 돌아가기</span>
                    </Link>
                    <button onClick={logout} style={{ width: "100%", background: "transparent", border: "none", display: "flex", alignItems: "center", gap: "0.75rem", color: "#ef4444", textDecoration: "none", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}>
                        <KeyRound size={18} />
                        <span>로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: "2rem", overflowY: "auto", position: "relative" }}>
                {/* Add some global styles just for HR section to override website dark mode */}
                <style>{`
                        .hr-nav-link:hover { background-color: #374151; color: white !important; }
                        * { box-sizing: border-box; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; }
                        td { color: #111827; font-size: 0.95rem; }
                        .btn-hr { padding: 0.5rem 1rem; border-radius: 4px; font-weight: 500; cursor: pointer; border: none; font-size: 0.875rem; transition: background 0.2s; }
                        .btn-hr-primary { background-color: #2563eb; color: white; }
                        .btn-hr-primary:hover { background-color: #1d4ed8; }
                        .btn-hr-outline { background-color: transparent; border: 1px solid #d1d5db; color: #374151; }
                        .btn-hr-outline:hover { background-color: #f3f4f6; }
                    `}</style>
                {children}

                {/* Global Chatbot Widget */}
                {session && <HRChatbotWidget />}
            </main>

        </div>
    );
}

export default function HRAdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <HRProvider>
            <AuthProvider>
                <HRLayoutContent>{children}</HRLayoutContent>
            </AuthProvider>
        </HRProvider>
    );
}
