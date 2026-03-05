"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, CalendarDays, BookOpen, ShieldCheck, LogOut, User, BellRing, Shield, FileCheck } from "lucide-react";
import HRChatbotWidget from "./chatbot/HRChatbotWidget";

export default function HRPortalLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentView = searchParams.get("view");
    const isLoginPage = pathname === "/hr-portal-admin/login";

    // For MVP, we'll assume a local mock session validation
    // In a real app with next-auth or JWT, this checks the server session cookie.
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Enforce login logic
        if (!isLoginPage) {
            const storedUser = localStorage.getItem("hr_user");
            if (!storedUser) {
                router.push("/hr-portal-admin/login");
            } else {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [isLoginPage, router]);

    if (isLoginPage || (!user && !isLoginPage)) {
        return <>{children}</>;
    }

    const allRoles = ["HR_ADMIN", "HEAD_OF_MANAGEMENT", "HEAD_OF_SALES", "SALES_TEAM_LEADER", "STORE_MANAGER", "STAFF", "HQ_TEAM_LEADER", "HQ_STAFF"];

    // 1. Personal Items (Everyone sees these but only for their own data)
    const personalNav = [
        { name: "내 대시보드", href: "/hr-portal-admin/dashboard?view=self", icon: LayoutDashboard, roles: allRoles },
        { name: "내 연차 및 휴가", href: "/hr-portal-admin/leave-self", icon: CalendarDays, roles: allRoles },
        { name: "재직증명서 발급", href: "/hr-portal-admin/certificates-self", icon: FileCheck, roles: allRoles },
        { name: "나의 정보 설정", href: "/hr-portal-admin/profile", icon: User, roles: allRoles },
    ];

    // 2. Management Items (Only Managers/Admins or users with specific granular permissions)
    const managementNav = [
        { name: "팀 총괄 대시보드", href: "/hr-portal-admin/dashboard?view=team", icon: LayoutDashboard, roles: ["HR_ADMIN", "HEAD_OF_MANAGEMENT", "HEAD_OF_SALES", "SALES_TEAM_LEADER", "STORE_MANAGER", "HQ_TEAM_LEADER"] },
        { name: "통합 임직원 명부", href: "/hr-portal-admin/employees", icon: Users, roles: ["HR_ADMIN", "HEAD_OF_MANAGEMENT", "HEAD_OF_SALES", "SALES_TEAM_LEADER", "STORE_MANAGER", "HQ_TEAM_LEADER", "HQ_STAFF"] },
        { name: "HR 챗봇 지식 베이스", href: "/hr-portal-admin/knowledge", icon: BookOpen, roles: ["HR_ADMIN", "HQ_TEAM_LEADER", "HQ_STAFF", "HEAD_OF_MANAGEMENT"] },
        { name: "연차 결재함", href: "/hr-portal-admin/leave", icon: CalendarDays, roles: ["HR_ADMIN", "HEAD_OF_MANAGEMENT", "HEAD_OF_SALES", "SALES_TEAM_LEADER", "STORE_MANAGER", "HQ_TEAM_LEADER"], customCheck: (u: any) => u.canManageLeaves },
        { name: "휴가 규정 관리", href: "/hr-portal-admin/leave-policy", icon: CalendarDays, roles: ["HR_ADMIN"] },
        { name: "증명서 발급 내역", href: "/hr-portal-admin/certificates", icon: FileCheck, roles: ["HR_ADMIN", "HEAD_OF_MANAGEMENT"] },
        { name: "주요 공지 관리", href: "/hr-portal-admin/announcements", icon: BellRing, roles: ["HR_ADMIN", "HEAD_OF_MANAGEMENT"], customCheck: (u: any) => u.canManageNotices },
        { name: "권한 부여 설정", href: "/hr-portal-admin/permissions", icon: Shield, roles: ["HR_ADMIN"] },
        { name: "보안 설정 (2FA)", href: "/hr-portal-admin/security", icon: ShieldCheck, roles: ["HR_ADMIN"] },
    ];

    const authorizedPersonalNav = personalNav.filter(item => item.roles.includes(user.role));
    const authorizedManagementNav = managementNav.filter(item => {
        if (item.roles.includes(user.role)) return true;
        if (item.customCheck && item.customCheck(user)) return true;
        return false;
    });

    const handleLogout = () => {
        localStorage.removeItem("hr_user");
        router.push("/hr-portal-admin/login");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
            {/* Sidebar */}
            <aside style={{ width: "260px", backgroundColor: "#1e293b", color: "white", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid #334155" }}>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0, color: "#f8fafc" }}>AGRA / NOYA</h1>
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>HR 통합 시스템 (HQ)</p>
                </div>

                <nav style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto" }}>

                    {/* 나의 HR Section */}
                    <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", margin: "0 0 0.5rem 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>나의 HR</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {authorizedPersonalNav.map((item) => {
                                const Icon = item.icon;
                                // Exact match check for everything except dashboard
                                const isActive = item.href.includes("dashboard")
                                    ? pathname.startsWith(item.href.split('?')[0]) && currentView === "self"
                                    : pathname === item.href.split('?')[0];
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem",
                                            borderRadius: "0.5rem", textDecoration: "none",
                                            backgroundColor: isActive ? "#3b82f6" : "transparent",
                                            color: isActive ? "white" : "#cbd5e1",
                                            fontWeight: isActive ? 600 : 400,
                                            transition: "background-color 0.2s"
                                        }}
                                    >
                                        <Icon size={18} />
                                        <span style={{ fontSize: "0.9rem" }}>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* 팀/매장 관리 Section */}
                    {authorizedManagementNav.length > 0 && (
                        <div>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", margin: "0 0 0.5rem 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀 / 조직 관리</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                {authorizedManagementNav.map((item) => {
                                    const Icon = item.icon;
                                    // Exact match for everything except dashboard team toggle
                                    const isActive = item.href.includes("dashboard")
                                        ? pathname.startsWith(item.href.split('?')[0]) && currentView === "team"
                                        : pathname === item.href.split('?')[0];

                                    const isCompanyWideRole = user?.role === "HR_ADMIN" || user?.role === "HEAD_OF_MANAGEMENT" || user?.role === "HEAD_OF_SALES";
                                    const displayName = item.name === "팀 총괄 대시보드" && isCompanyWideRole
                                        ? "전사 총괄 대시보드"
                                        : item.name;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem",
                                                borderRadius: "0.5rem", textDecoration: "none",
                                                backgroundColor: isActive ? "#3b82f6" : "transparent",
                                                color: isActive ? "white" : "#cbd5e1",
                                                fontWeight: isActive ? 600 : 400,
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <Icon size={18} />
                                            <span style={{ fontSize: "0.9rem" }}>{displayName}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                <div style={{ padding: "1.5rem", borderTop: "1px solid #334155" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
                            {user.name.substring(0, 1)}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "white" }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                                {user.role === "HR_ADMIN" ? "최고 관리자"
                                    : user.role === "HEAD_OF_MANAGEMENT" ? "관리 본부장"
                                        : user.role === "HEAD_OF_SALES" ? "영업 본부장"
                                            : user.role === "SALES_TEAM_LEADER" ? "영업 팀장"
                                                : user.role === "HQ_TEAM_LEADER" ? "본사 팀장"
                                                    : user.role === "STORE_MANAGER" ? "매장 점장"
                                                        : user.role === "HQ_STAFF" ? "본사 사원"
                                                            : "일반 사원"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", backgroundColor: "transparent", color: "#cbd5e1", border: "1px solid #475569", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#334155"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#cbd5e1"; }}
                    >
                        <LogOut size={16} /> 로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
                <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#111827", fontWeight: 600 }}>
                        {pathname.includes("dashboard")
                            ? (currentView === "team" ? (user?.role === "HR_ADMIN" || user?.role === "HEAD_OF_MANAGEMENT" || user?.role === "HEAD_OF_SALES" ? "전사 총괄 대시보드" : "팀 총괄 대시보드") : "내 대시보드")
                            : [...personalNav, ...managementNav].find(item => pathname === item.href.split('?')[0])?.name || "대시보드"
                        }
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontSize: "0.85rem", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "0.25rem 0.75rem", borderRadius: "99px" }}>
                            보안 세션 활성화
                        </span>
                    </div>
                </header>

                <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {children}
                </div>
            </main>

            {/* Chatbot Widget Overlay */}
            {!isLoginPage && user && <HRChatbotWidget />}
        </div>
    );
}
