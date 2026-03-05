"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import "../admin.css"; // Reuse some global admin styles

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple mock authentication (Accepts 'admin' as password)
        if (password === "admin") {
            // In a real app, you would set a cookie or token here
            localStorage.setItem("isAdmin", "true");
            router.push("/admin");
        } else {
            setError(true);
        }
    };

    return (
        <div className="admin-layout" style={{ justifyContent: "center", alignItems: "center" }}>
            <div className="login-card" style={{
                background: "#1a1d24",
                padding: "3rem",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "400px",
                border: "1px solid #2d3748",
                textAlign: "center"
            }}>
                <div style={{ marginBottom: "2rem" }}>
                    <Lock size={48} color="var(--gold-primary)" style={{ margin: "0 auto", marginBottom: "1rem" }} />
                    <h1 style={{ fontFamily: "var(--font-playfair), serif", color: "#fff", fontSize: "2rem", marginBottom: "0.5rem" }}>
                        AGRA CMS
                    </h1>
                    <p style={{ color: "#a0aec0", fontSize: "0.9rem" }}>관리자 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                        <label style={{ display: "block", color: "#a0aec0", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                            관리자 비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            placeholder="힌트: admin"
                            style={{
                                width: "100%",
                                padding: "1rem",
                                background: "#0f1115",
                                border: error ? "1px solid #e53e3e" : "1px solid #2d3748",
                                borderRadius: "6px",
                                color: "#fff",
                                fontSize: "1rem",
                                outline: "none"
                            }}
                        />
                        {error && <span style={{ color: "#e53e3e", fontSize: "0.8rem", marginTop: "0.5rem", display: "block" }}>비밀번호가 올바르지 않습니다.</span>}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "1rem" }}>
                        대시보드 접속
                    </button>
                </form>
            </div>
        </div>
    );
}
