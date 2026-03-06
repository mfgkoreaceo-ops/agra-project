"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileSignature, Calendar, RefreshCcw } from "lucide-react";

export default function ResignationSelfService() {
    const [user, setUser] = useState<any>(null);
    const [resignationDate, setResignationDate] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myRecord, setMyRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const storedUser = localStorage.getItem("hr_user");
                if (!storedUser) return;
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                const res = await fetch(`/api/hr/resignations?employeeId=${parsedUser.id}`);
                const data = await res.json();
                if (data && data.id) {
                    setMyRecord(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, []);

    // Canvas Drawing Logic
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // reset path
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const isCanvasBlank = (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(
            context!.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !pixelBuffer.some(color => color !== 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return alert("로그인 정보가 없습니다.");
        if (!resignationDate || !reason) return alert("모든 항목을 입력해주세요.");

        const canvas = canvasRef.current;
        if (!canvas || isCanvasBlank(canvas)) {
            return alert("서명란에 직접 터치/마우스로 서명을 그려주세요.");
        }

        const signatureData = canvas.toDataURL("image/png");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/hr/resignations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: user.id,
                    resignationDate,
                    reason,
                    signatureData
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMyRecord(data.resignation);
                alert("사직서가 성공적으로 제출되었습니다. 결재 대기 중입니다.");
            } else {
                throw new Error("제출 실패");
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류로 인해 제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: "2rem" }}>데이터 로딩 중...</div>;

    if (myRecord) {
        return (
            <div style={{ paddingBottom: "3rem", maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>사직서 제출 내역</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        귀하가 제출한 사직서 결재 상태를 확인합니다.
                    </p>
                </div>

                <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
                        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#111827" }}>제출 정보</h2>
                        <div>
                            {myRecord.status === "PENDING" && <span style={{ padding: "0.5rem 1rem", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "99px", fontWeight: 600, fontSize: "0.9rem" }}>결재 대기</span>}
                            {myRecord.status === "APPROVED" && <span style={{ padding: "0.5rem 1rem", backgroundColor: "#d1fae5", color: "#059669", borderRadius: "99px", fontWeight: 600, fontSize: "0.9rem" }}>수리 완료</span>}
                            {myRecord.status === "REJECTED" && <span style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "99px", fontWeight: 600, fontSize: "0.9rem" }}>반려됨</span>}
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: "1.5rem" }}>
                        <div>
                            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#6b7280" }}>퇴사 희망일</p>
                            <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{new Date(myRecord.resignationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "#6b7280" }}>퇴사 사유</p>
                            <div style={{ backgroundColor: "#f9fafb", padding: "1rem", borderRadius: "0.5rem", color: "#374151" }}>
                                {myRecord.reason}
                            </div>
                        </div>
                        <div>
                            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#6b7280" }}>전자 서명 (보안 암호화)</p>
                            <div style={{ padding: "1rem", backgroundColor: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: "0.5rem", width: "300px", height: "150px" }}>
                                <img src={myRecord.signatureData} alt="나의 서명" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: "3rem", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>전자 사직서 제출</h1>
                <p style={{ color: "#ef4444", margin: "0.5rem 0 0 0", fontSize: "0.95rem", fontWeight: 500 }}>
                    ※ 사직서를 제출하시면 철회가 어려울 수 있습니다. 신중하게 작성해 주세요.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                        제출자 정보
                    </label>
                    <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "#6b7280" }}>소속 / 직급</p>
                            <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{user?.brand} - {user?.department} ({user?.role})</p>
                        </div>
                        <div>
                            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "#6b7280" }}>성명 / 사번</p>
                            <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{user?.name} ({user?.employeeNumber})</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                        <Calendar size={18} color="#4b5563" /> 퇴사 희망일 (마지막 근무일)
                    </label>
                    <input
                        type="date"
                        required
                        value={resignationDate}
                        onChange={(e) => setResignationDate(e.target.value)}
                        style={{ width: "100%", padding: "0.8rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "1rem", color: "#111827", backgroundColor: "white" }}
                    />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                        <FileSignature size={18} color="#4b5563" /> 퇴사 사유
                    </label>
                    <textarea
                        required
                        rows={4}
                        placeholder="퇴사 사유를 구체적으로 작성해 주세요. (개인 사정 등)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        style={{ width: "100%", padding: "0.8rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", fontSize: "0.95rem", resize: "vertical", color: "#111827", backgroundColor: "white" }}
                    />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.95rem", fontWeight: 600, color: "#374151", margin: 0 }}>
                            본인 서명 (전자 날인)
                        </label>
                        <button type="button" onClick={clearSignature} style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.85rem" }}>
                            <RefreshCcw size={14} /> 서명 다시 쓰기
                        </button>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0 0 0.5rem 0" }}>
                        스마트폰 화면 혹은 마우스를 이용하여 아래 빈 칸에 본인의 자필 서명을 그려주세요.
                    </p>
                    <div style={{ border: "2px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "#f9fafb" }}>
                        <canvas
                            ref={canvasRef}
                            width={800} // responsive width via CSS
                            height={250}
                            style={{ display: "block", width: "100%", touchAction: "none", cursor: "crosshair" }}
                            onMouseDown={startDrawing}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onMouseMove={draw}
                            onTouchStart={startDrawing}
                            onTouchEnd={stopDrawing}
                            onTouchMove={draw}
                        />
                    </div>
                    <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#4b5563", marginTop: "1rem" }}>
                        본인은 상기 명시된 사유로 인하여 사직서를 제출하며, <br />이에 포함된 모든 정보는 사실과 다름없음을 전자 서명으로 갈음합니다.
                    </p>
                </div>

                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ padding: "0.8rem 2rem", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer" }}
                    >
                        {isSubmitting ? "제출 중..." : "최종 제출 및 결재 요청"}
                    </button>
                </div>
            </form>
        </div>
    );
}
