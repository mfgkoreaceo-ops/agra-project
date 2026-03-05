"use client";

import React, { useState, useEffect } from "react";
import { BellRing, Plus, Trash2, Edit } from "lucide-react";

export default function AnnouncementsPage() {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isImportant, setIsImportant] = useState(false);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hr/announcements");
            const data = await res.json();
            if (res.ok) {
                setNotices(data.notices);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem("hr_user");
            const author = userStr ? JSON.parse(userStr).name : "인사팀";

            const res = await fetch("/api/hr/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, isImportant, author })
            });

            if (res.ok) {
                setShowForm(false);
                setTitle("");
                setContent("");
                setIsImportant(false);
                fetchNotices();
            } else {
                alert("공지 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <BellRing size={24} color="#3b82f6" /> 주요 공지 관리
                    </h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        사내 게시판 및 대시보드에 노출되는 공지사항을 관리합니다.
                    </p>
                </div>
                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}
                    >
                        <Plus size={18} /> 새 공지 등록
                    </button>
                )}
            </div>

            {showForm && (
                <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "2rem" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>공지사항 작성</h3>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>제목</label>
                            <input 
                                type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "1rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>내용</label>
                            <textarea 
                                value={content} onChange={(e) => setContent(e.target.value)} required rows={5}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "1rem", resize: "vertical" }}
                            />
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#4b5563", cursor: "pointer" }}>
                            <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} style={{ width: "1rem", height: "1rem" }} />
                            긴급/중요 공지로 등록 (대시보드 상단 고정 강조)
                        </label>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button type="submit" style={{ flex: 1, padding: "0.75rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}>
                                등록하기
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "0.75rem", backgroundColor: "transparent", color: "#4b5563", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}>
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>중요</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>제목</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>작성자</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>등록일</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : notices.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>등록된 공지사항이 없습니다.</td></tr>
                        ) : (
                            notices.map((n) => (
                                <tr key={n.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        {n.isImportant ? <span style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.25rem 0.5rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>중요</span> : "-"}
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", fontWeight: 500, color: "#111827" }}>{n.title}</td>
                                    <td style={{ padding: "1rem 1.5rem", color: "#6b7280", fontSize: "0.9rem" }}>{n.author}</td>
                                    <td style={{ padding: "1rem 1.5rem", color: "#6b7280", fontSize: "0.9rem" }}>{new Date(n.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
