"use client";

import React, { useEffect, useState } from "react";
import { Users, FileText, CheckCircle, AlertCircle, Clock, Calendar, Building2, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function HRDashboard() {
    const searchParams = useSearchParams();
    const isTeamView = searchParams.get("view") === "team";

    const [stats, setStats] = useState({ totalEmployees: 0, totalPending: 0, myPending: 0, expiringHealthCerts: [] });
    const [user, setUser] = useState<any>(null);
    const [notices, setNotices] = useState<any[]>([]);

    useEffect(() => {
        const fetchStatsAndNotices = async (currentUser: any) => {
            try {
                const queryParam = currentUser ? `?userId=${currentUser.id}` : '';
                const [dashRes, noticeRes] = await Promise.all([
                    fetch(`/api/hr/dashboard${queryParam}`),
                    fetch("/api/hr/announcements")
                ]);

                if (dashRes.ok) {
                    const dashData = await dashRes.json();
                    setStats({
                        totalEmployees: dashData.totalEmployees,
                        totalPending: dashData.totalPending,
                        myPending: dashData.myPending || 0,
                        expiringHealthCerts: dashData.expiringHealthCerts || []
                    });
                }
                if (noticeRes.ok) {
                    const noticeData = await noticeRes.json();
                    setNotices(noticeData.notices || []);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchStatsAndNotices(parsedUser);
        } else {
            fetchStatsAndNotices(null);
        }
    }, []);

    const { totalEmployees, totalPending, myPending, expiringHealthCerts } = stats;

    const managementRoles = ["HR_ADMIN", "HEAD_OF_MANAGEMENT", "HEAD_OF_SALES", "SALES_TEAM_LEADER", "STORE_MANAGER", "HQ_TEAM_LEADER"];
    const hasManagementAccess = user && managementRoles.includes(user.role);
    const isCompanyWideRole = user && ["HR_ADMIN", "HEAD_OF_MANAGEMENT", "HEAD_OF_SALES"].includes(user.role);

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
                        {isTeamView && hasManagementAccess ? (isCompanyWideRole ? "전사 총괄 대시보드" : "팀/조직 총괄 대시보드") : "나의 HR 대시보드"}
                    </h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        {isTeamView && hasManagementAccess ? (isCompanyWideRole ? "아그라 및 노야 전 세계 임직원 통합 현황" : "아그라 및 노야 소속팀 임직원 현황") : "나의 근태 및 활동 내역"}
                    </p>
                </div>

                {/* View Toggler */}
                {hasManagementAccess && (
                    <div style={{ display: "flex", backgroundColor: "#f3f4f6", padding: "0.25rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                        <Link
                            href="/hr-portal-admin/dashboard?view=self"
                            style={{
                                padding: "0.5rem 1rem", borderRadius: "0.375rem", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none",
                                backgroundColor: !isTeamView ? "white" : "transparent",
                                color: !isTeamView ? "#2563eb" : "#6b7280",
                                boxShadow: !isTeamView ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.2s"
                            }}
                        >
                            내 HR 보기
                        </Link>
                        <Link
                            href="/hr-portal-admin/dashboard?view=team"
                            style={{
                                padding: "0.5rem 1rem", borderRadius: "0.375rem", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none",
                                backgroundColor: isTeamView ? "white" : "transparent",
                                color: isTeamView ? "#2563eb" : "#6b7280",
                                boxShadow: isTeamView ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                transition: "all 0.2s"
                            }}
                        >
                            {isCompanyWideRole ? "전사 대시보드" : "팀 대시보드"}
                        </Link>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {isTeamView && hasManagementAccess ? (
                    <>
                        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ backgroundColor: "#eff6ff", padding: "1rem", borderRadius: "0.5rem", color: "#3b82f6" }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>{isCompanyWideRole ? "전사 총 재직 인원" : "팀 총 재직 인원"}</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{totalEmployees} 명</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ backgroundColor: "#fef3c7", padding: "1rem", borderRadius: "0.5rem", color: "#d97706" }}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>{isCompanyWideRole ? "전사 발생 결재 대기" : "팀 소속 결재 대기"}</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{totalPending} 건</p>
                                <p style={{ margin: "0", fontSize: "0.75rem", color: "#9ca3af" }}>휴가 및 사직서 포함</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ backgroundColor: "#dcfce7", padding: "1rem", borderRadius: "0.5rem", color: "#16a34a" }}>
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>이번 달 급여 정산</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>완료 대기</p>
                            </div>
                        </div>

                    </>
                ) : (
                    <>
                        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ backgroundColor: "#f3e8ff", padding: "1rem", borderRadius: "0.5rem", color: "#9333ea" }}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>올해 잔여 연차</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>15 일</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ backgroundColor: "#ecfdf5", padding: "1rem", borderRadius: "0.5rem", color: "#10b981" }}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>나의 소속 및 직책</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.2rem", fontWeight: "bold", color: "#111827" }}>
                                    {user?.brand || "미지정"} {user?.department || ""} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "normal" }}>({
                                        user?.role === 'STORE_MANAGER' ? '점장' :
                                            user?.role === 'KITCHEN_MANAGER' ? '주방장' :
                                                user?.role === 'HALL_MANAGER' ? '홀매니저' :
                                                    user?.role === 'STAFF' ? '사원' :
                                                        user?.role === 'HR_ADMIN' ? '인사 관리자' :
                                                            user?.role === 'HEAD_OF_MANAGEMENT' ? '경영 총괄' :
                                                                user?.role === 'HEAD_OF_SALES' ? '영업 총괄' :
                                                                    user?.role === 'SALES_TEAM_LEADER' ? '영업 팀장' :
                                                                        user?.role === 'HQ_TEAM_LEADER' ? '본사 팀장' :
                                                                            '직책 미정'
                                    })</span>
                                </p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ backgroundColor: "#fef3c7", padding: "1rem", borderRadius: "0.5rem", color: "#d97706" }}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>진행 중인 결재</p>
                                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{myPending} 건</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Health Cert Alert Dashboard Widget (Visible to HR Admins) */}
            {isCompanyWideRole && expiringHealthCerts.length > 0 && (
                <div style={{ backgroundColor: "#fef2f2", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #fecaca", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b91c1c", borderBottom: "1px solid #fecaca", paddingBottom: "0.75rem" }}>
                        <AlertTriangle size={20} />
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>본사 HR팀 알림: 보건증 미제출 및 만료 임박 현황 (총 {expiringHealthCerts.length}명)</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {expiringHealthCerts.map((hc: any, idx) => {
                            let statusText = "미제출";
                            let statusColor = "#dc2626"; // Red
                            if (hc.healthCertificateExp) {
                                const expDate = new Date(hc.healthCertificateExp);
                                const diffObj = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                if (diffObj < 0) {
                                    statusText = `만료됨 (초과 ${Math.abs(diffObj)}일)`;
                                } else {
                                    statusText = `만료 임박 (${diffObj}일 남음)`;
                                    statusColor = "#d97706"; // Amber
                                }
                            }

                            // Display up to 6 naturally, then show a summary if there's too many
                            if (idx >= 6) return null;

                            return (
                                <div key={hc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #fee2e2" }}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>{hc.name}</span>
                                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{hc.storeName}</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: statusColor }}>{statusText}</span>
                                        <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                                            {hc.healthCertificateExp ? new Date(hc.healthCertificateExp).toLocaleDateString() : '발급일자 없음'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {expiringHealthCerts.length > 6 && (
                        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                            <Link href="/hr-portal-admin/employees" style={{ fontSize: "0.9rem", color: "#b91c1c", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                                외 {expiringHealthCerts.length - 6}명 전체 보기 <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions & Recent */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#374151", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FileText size={18} /> 최근 주요 공지
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {notices.length === 0 ? (
                            <li style={{ fontSize: "0.95rem", color: "#6b7280", textAlign: "center", padding: "1rem" }}>등록된 공지가 없습니다.</li>
                        ) : (
                            notices.slice(0, 5).map((notice, idx) => (
                                <li key={notice.id} style={{ fontSize: "0.95rem", color: "#4b5563", borderBottom: idx === Math.min(notices.length, 5) - 1 ? "none" : "1px solid #f3f4f6", paddingBottom: idx === Math.min(notices.length, 5) - 1 ? 0 : "0.75rem" }}>
                                    {notice.isImportant && <span style={{ color: "#dc2626", fontWeight: 600, marginRight: "0.5rem" }}>[긴급]</span>}
                                    {!notice.isImportant && <span style={{ color: "#3b82f6", fontWeight: 600, marginRight: "0.5rem" }}>[공지]</span>}
                                    {notice.title}
                                    <span style={{ float: "right", color: "#9ca3af", fontSize: "0.8rem" }}>
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#374151" }}>
                        {isTeamView && hasManagementAccess ? (isCompanyWideRole ? "최근 승인된 임직원 휴가" : "최근 승인된 팀원 휴가") : "가장 최근 나의 활동"}
                    </h3>
                    <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px dashed #d1d5db" }}>
                        내역이 없습니다.
                    </div>
                </div>
            </div>
        </div>
    );
}
