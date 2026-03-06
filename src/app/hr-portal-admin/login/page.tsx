"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";

export default function HRPortalLogin() {
    const router = useRouter();
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otpToken, setOtpToken] = useState("");
    const [step, setStep] = useState<"LOGIN" | "SETUP" | "FIND_ID" | "2FA_SETUP" | "2FA_VERIFY">("LOGIN");

    // Find ID state
    const [findIdName, setFindIdName] = useState("");
    const [findIdPhone, setFindIdPhone] = useState("");
    const [foundId, setFoundId] = useState<string | null>(null);

    // Setup state
    const [setupName, setSetupName] = useState("");
    const [setupPhone, setSetupPhone] = useState("");
    const [setupPassword, setSetupPassword] = useState("");
    const [showSetupPassword, setShowSetupPassword] = useState(false);
    const [setupPasswordConfirm, setSetupPasswordConfirm] = useState("");
    const [showSetupPasswordConfirm, setShowSetupPasswordConfirm] = useState(false);

    const [qrCodeData, setQrCodeData] = useState("");
    const [secretKey, setSecretKey] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInitialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/hr-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeNumber, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "로그인에 실패했습니다.");
            }

            // If login succeeds, check 2FA status
            if (data.requiresSetup) {
                // Must set up 2FA
                setQrCodeData(data.qrCodeUrl);
                setSecretKey(data.secret);
                setStep("2FA_SETUP");
            } else {
                // Must verify 2FA
                setStep("2FA_VERIFY");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeNumber, token: otpToken })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "잘못된 인증 코드입니다.");
            }

            // Save session state locally
            localStorage.setItem("hr_user", JSON.stringify(data.user));

            alert("인증이 완료되었습니다. 대시보드로 이동합니다.");
            router.push("/hr-portal-admin/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFindIdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFoundId(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/hr-find-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: findIdName, phone: findIdPhone })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "사번 찾기에 실패했습니다.");
            }

            setFoundId(data.employeeNumber);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (setupPassword !== setupPasswordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(setupPassword)) {
            alert("비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 최소 8자리 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/hr-setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeNumber,
                    name: setupName,
                    phone: setupPhone,
                    newPassword: setupPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "비밀번호 설정에 실패했습니다.");
            }

            alert("비밀번호 설정이 완료되었습니다. 설정하신 비밀번호로 로그인해주세요.");
            setStep("LOGIN");
            setPassword(""); // clear so they can type the new one

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
            <div style={{ backgroundColor: "white", padding: "3rem", borderRadius: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", width: "100%", maxWidth: "450px" }}>

                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "4rem", height: "4rem", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", marginBottom: "1rem" }}>
                        <Building2 size={32} />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>HRMS 통합 로그인</h1>
                    <p style={{ color: "#6b7280", marginTop: "0.5rem", fontSize: "0.95rem" }}>
                        아그라 & 노야 임직원 전용 시스템
                    </p>
                </div>

                {error && (
                    <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "0.5rem", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                {step === "LOGIN" && (
                    <form onSubmit={handleInitialLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>사번</label>
                            <input
                                type="text"
                                value={employeeNumber}
                                onChange={(e) => setEmployeeNumber(e.target.value)}
                                placeholder="예: 20260101"
                                required
                                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>비밀번호</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                    style={{ width: "100%", padding: "0.75rem 3rem 0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !employeeNumber || !password}
                            style={{ padding: "0.875rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem" }}
                        >
                            {loading ? "인증 중..." : "로그인"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "1rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                            <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0 0 0.5rem 0" }}>계정 정보를 잊으셨거나 처음이신가요?</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                                <button
                                    type="button"
                                    onClick={() => { setStep("FIND_ID"); setError(""); setFoundId(null); setFindIdName(""); setFindIdPhone(""); }}
                                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: "0.95rem" }}
                                >
                                    사번 찾기
                                </button>
                                <span style={{ color: "#d1d5db" }}>|</span>
                                <button
                                    type="button"
                                    onClick={() => { setStep("SETUP"); setError(""); }}
                                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: "0.95rem" }}
                                >
                                    최초 설정
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {step === "FIND_ID" && (
                    <form onSubmit={handleFindIdSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#111827", margin: 0 }}>사번 찾기</h2>
                            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.25rem" }}>등록된 본인 이름과 연락처를 입력해주세요.</p>
                        </div>

                        {!foundId ? (
                            <>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>이름</label>
                                    <input type="text" value={findIdName} onChange={(e) => setFindIdName(e.target.value)} placeholder="본인 이름" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>휴대폰 번호 (-포함)</label>
                                    <input type="text" value={findIdPhone} onChange={(e) => setFindIdPhone(e.target.value)} placeholder="010-0000-0000" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                                </div>
                                <button type="submit" disabled={loading} style={{ padding: "0.875rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem" }}>
                                    {loading ? "조회 중..." : "내 사번 확인하기"}
                                </button>
                            </>
                        ) : (
                            <div style={{ padding: "1.5rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", textAlign: "center" }}>
                                <p style={{ margin: "0 0 0.5rem 0", color: "#166534", fontSize: "0.95rem" }}>조회된 사번은 다음과 같습니다.</p>
                                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#15803d", letterSpacing: "1px" }}>{foundId}</p>
                            </div>
                        )}

                        <button type="button" onClick={() => setStep("LOGIN")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem", marginTop: foundId ? "1rem" : "-0.5rem" }}>
                            로그인 화면으로 돌아가기
                        </button>
                    </form>
                )}

                {step === "SETUP" && (
                    <form onSubmit={handleSetupSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "0.5rem", color: "#1e3a8a", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                            <strong>최초 방문 및 계정 설정</strong><br />
                            안전한 계정 사용을 위해 본인 확인 후 사용할 새 비밀번호를 설정해주세요. (이후 비밀번호 변경/재설정은 본사 인사팀을 통해서만 가능합니다)
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>사번</label>
                            <input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="예: 20260101" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>이름</label>
                                <input type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="본인 이름" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>휴대폰 번호 (-포함)</label>
                                <input type="text" value={setupPhone} onChange={(e) => setSetupPhone(e.target.value)} placeholder="010-0000-0000" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>새 비밀번호 설정</label>
                            <div style={{ position: "relative" }}>
                                <input type={showSetupPassword ? "text" : "password"} value={setupPassword} onChange={(e) => setSetupPassword(e.target.value)} placeholder="사용할 비밀번호 입력" required style={{ width: "100%", padding: "0.75rem 3rem 0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                                <button type="button" onClick={() => setShowSetupPassword(!showSetupPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                                    {showSetupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>새 비밀번호 확인</label>
                            <div style={{ position: "relative" }}>
                                <input type={showSetupPasswordConfirm ? "text" : "password"} value={setupPasswordConfirm} onChange={(e) => setSetupPasswordConfirm(e.target.value)} placeholder="비밀번호 다시 입력" required style={{ width: "100%", padding: "0.75rem 3rem 0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem" }} />
                                <button type="button" onClick={() => setShowSetupPasswordConfirm(!showSetupPasswordConfirm)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                                    {showSetupPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{ padding: "0.875rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem" }}>
                            {loading ? "처리 중..." : "본인 확인 및 비밀번호 설정 완료"}
                        </button>
                        <button type="button" onClick={() => setStep("LOGIN")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem", marginTop: "-0.5rem" }}>
                            뒤로 가기
                        </button>
                    </form>
                )}

                {step === "2FA_SETUP" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "0.5rem", color: "#92400e", fontSize: "0.9rem" }}>
                            <strong>최초 1회 보안 설정이 필요합니다.</strong><br />
                            Google Authenticator 앱을 열고 아래 QR 코드를 스캔하세요.
                        </div>

                        {qrCodeData && (
                            <img src={qrCodeData} alt="2FA QR Code" style={{ margin: "0 auto", display: "block", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem" }} />
                        )}
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "1rem" }}>
                            비밀키 수동 입력: <strong style={{ letterSpacing: "1px" }}>{secretKey}</strong>
                        </p>

                        <form onSubmit={handleVerify2FA} style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="6자리 인증 코드 입력"
                                value={otpToken}
                                onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ""))}
                                required
                                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem", padding: "0.75rem", width: "100%", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                            />
                            <button
                                type="submit"
                                disabled={loading || otpToken.length !== 6}
                                style={{ padding: "0.875rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, fontSize: "1rem", cursor: otpToken.length === 6 && !loading ? "pointer" : "not-allowed" }}
                            >
                                {loading ? "확인 중..." : "설정 완료"}
                            </button>
                        </form>
                    </div>
                )}

                {step === "2FA_VERIFY" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", color: "#059669", marginBottom: "1rem" }}>
                            <ShieldCheck size={48} />
                        </div>
                        <h2 style={{ fontSize: "1.25rem", color: "#111827", margin: "0 0 1.5rem 0" }}>2단계 인증</h2>
                        <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "2rem" }}>
                            Google Authenticator 앱에서 생성된<br />6자리 코드를 입력해주세요.
                        </p>

                        <form onSubmit={handleVerify2FA} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ position: "relative" }}>
                                <KeyRound size={20} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={otpToken}
                                    onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ""))}
                                    required
                                    style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem", padding: "0.75rem 0.75rem 0.75rem 3rem", width: "100%", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otpToken.length !== 6}
                                style={{ padding: "0.875rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, fontSize: "1rem", cursor: otpToken.length === 6 && !loading ? "pointer" : "not-allowed" }}
                            >
                                {loading ? "인증 중..." : "인증하기"}
                            </button>
                        </form>
                        <button onClick={() => setStep("LOGIN")} style={{ marginTop: "1.5rem", background: "none", border: "none", fontSize: "0.85rem", color: "#6b7280", cursor: "pointer", textDecoration: "underline" }}>
                            처음으로 돌아가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
