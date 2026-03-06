"use client";

import React, { useEffect, useState } from "react";
import { FileCheck, Download, Calendar, Briefcase, User, Search } from "lucide-react";

export default function CertificateIssuancePage() {
    const [user, setUser] = useState<any>(null);
    const [purpose, setPurpose] = useState("금융기관 제출용");
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) setUser(JSON.parse(storedUser));

        // In a real app, fetch issuance history from API here
    }, []);

    const handleIssue = async () => {
        if (!user) return;
        setIsGenerating(true);

        try {
            // Wait 1s to simulate PDF generation
            await new Promise(res => setTimeout(res, 1000));

            // Record the issuance in the database
            const recordRes = await fetch("/api/hr/certificates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: user.id,
                    type: "CERTIFICATE_OF_EMPLOYMENT",
                    purpose: purpose
                })
            });

            if (recordRes.ok) {
                alert("재직증명서가 발급되었습니다. (MVP: 파일 다운로드 시뮬레이션 성공)");
                const newRecord = await recordRes.json();
                setHistory([newRecord.certificate, ...history]);
            } else {
                throw new Error("Failed to record issuance");
            }
        } catch (error) {
            alert("발급 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!user) return <div style={{ padding: "2rem" }}>Loading...</div>;

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>재직증명서 발급</h1>
                <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                    제출 목적을 선택한 후 발급 버튼을 눌러 문서를 다운로드하세요.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Preview Card */}
                <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", color: "#374151", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FileCheck size={18} /> 재직증명서 시안 미리보기
                    </h3>

                    <div style={{ padding: "3rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", backgroundColor: "white" }} id="certificate-print-area">
                        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                            <h2 style={{ display: "inline-block", fontSize: "2.5rem", fontWeight: "900", margin: 0, letterSpacing: "0.8em", color: "#111827", borderBottom: "2px solid #111827", paddingBottom: "5px", position: "relative", paddingLeft: "0.8em" }}>
                                재직증명서
                                <div style={{ position: "absolute", bottom: "-6px", left: 0, right: 0, height: "1px", backgroundColor: "#111827" }}></div>
                            </h2>
                        </div>

                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4rem", border: "2px solid #111827" }}>
                            <tbody>
                                <tr>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", width: "20%", textAlign: "center", color: "#111827", fontWeight: 600 }}>소 속</th>
                                    <td style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", width: "30%", textAlign: "center" }}>{user.brand} {user.department}</td>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", width: "20%", textAlign: "center", color: "#111827", fontWeight: 600 }}>직 급</th>
                                    <td style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", width: "30%", textAlign: "center" }}>{user.jobTitle || user.role}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", textAlign: "center", color: "#111827", fontWeight: 600 }}>성 명</th>
                                    <td style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", textAlign: "center", letterSpacing: "0.2em" }}>{user.name}</td>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", textAlign: "center", color: "#111827", fontWeight: 600 }}>생 년 월 일</th>
                                    <td style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", textAlign: "center" }}></td>
                                </tr>
                                <tr>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", textAlign: "center", color: "#111827", fontWeight: 600 }}>소 재 지</th>
                                    <td colSpan={3} style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", textAlign: "center" }}>{user.storeName}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", textAlign: "center", color: "#111827", fontWeight: 600 }}>전 화 번 호</th>
                                    <td colSpan={3} style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", textAlign: "center", letterSpacing: "0.1em" }}>{user.phone || "-"}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", textAlign: "center", color: "#111827", fontWeight: 600 }}>재 직 기 간</th>
                                    <td colSpan={3} style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", textAlign: "center" }}>{new Date(user.joinedAt).toLocaleDateString()} ~ 현재</td>
                                </tr>
                                <tr>
                                    <th style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "#f3f4f6", textAlign: "center", color: "#111827", fontWeight: 600 }}>발 급 사 유</th>
                                    <td colSpan={3} style={{ border: "1px solid #111827", padding: "1rem", backgroundColor: "white", color: "#111827", textAlign: "center" }}>{purpose}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h3 style={{ textAlign: "center", fontSize: "1.3rem", fontWeight: "500", margin: "0 0 4rem 0", color: "#111827", letterSpacing: "0.1em" }}>상기와 같이 재직하고 있음을 증명함</h3>

                        <div style={{ textAlign: "center", position: "relative" }}>
                            <p style={{ margin: "0 0 3rem 0", fontSize: "1.2rem", color: "#111827", letterSpacing: "0.1em" }}>
                                {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일
                            </p>
                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingRight: "10%" }}>
                                <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#111827", letterSpacing: "0.3em" }}>주식회사 아그라</p>
                                <span style={{ marginLeft: "1rem", color: "#111827" }}>(인/서명)</span>
                            </div>
                            <div style={{ position: "absolute", bottom: "-10px", right: "8%", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {localStorage.getItem("company_seal_image") ? (
                                    <img src={localStorage.getItem("company_seal_image") as string} alt="직인" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                ) : (
                                    <div style={{ width: "60px", height: "60px", border: "3px solid #dc2626", borderRadius: "50%", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem", opacity: 0.8, transform: "rotate(-10deg)" }}>직인</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issuance Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", color: "#374151" }}>발급 옵션</h3>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>제출 용도</label>
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", outline: "none", fontSize: "0.95rem" }}
                            >
                                <option value="금융기관 제출용">금융기관 제출용 (대출, 계좌개설 등)</option>
                                <option value="관공서 제출용">관공서 제출용</option>
                                <option value="이직/취업용">이직/취업용</option>
                                <option value="개인 확인용">개인 확인용</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>

                        <button
                            onClick={handleIssue}
                            disabled={isGenerating}
                            style={{
                                width: "100%", padding: "1rem", backgroundColor: "#3b82f6", color: "white",
                                border: "none", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600,
                                cursor: isGenerating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                                opacity: isGenerating ? 0.7 : 1
                            }}
                        >
                            <Download size={20} />
                            {isGenerating ? "문서 생성 중..." : "PDF 다운로드 및 발급"}
                        </button>
                    </div>

                    <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", flex: 1 }}>
                        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#374151" }}>최근 내 발급 기록</h3>
                        {history.length === 0 ? (
                            <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem 0", fontSize: "0.95rem" }}>
                                조회된 발급 기록이 없습니다.
                            </div>
                        ) : (
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {history.map((rec, idx) => (
                                    <li key={idx} style={{ padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <p style={{ margin: "0 0 0.25rem 0", fontWeight: 500, color: "#374151" }}>{rec.purpose}</p>
                                            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>{new Date(rec.issuedAt).toLocaleString()}</p>
                                        </div>
                                        <span style={{ fontSize: "0.8rem", backgroundColor: "#ecfdf5", color: "#10b981", padding: "0.25rem 0.5rem", borderRadius: "1rem" }}>발급완료</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
