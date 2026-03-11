"use client";

import React, { useState, useEffect } from "react";
import { BellRing, Plus, Trash2, Edit, Download, Paperclip } from "lucide-react";

export default function AnnouncementsPage() {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form States
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("일반 공지");
    const [isImportant, setIsImportant] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("전체");
    const categories = ["전체", "일반 공지", "인사 관련 서식 파일", "인사 관련 매뉴얼", "업무 마감일", "매장 보험 증서"];

    // User permissions
    const [canManage, setCanManage] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) {
            const u = JSON.parse(storedUser);
            if (u.role === "HR_ADMIN" || u.role === "HEAD_OF_MANAGEMENT" || u.department === "인사팀" || u.canManageNotices) {
                setCanManage(true);
            }
        }
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("파일 크기는 2MB 이하여야 합니다.");
                e.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachmentUrl(reader.result as string);
                setAttachmentName(file.name);
            };
            reader.readAsDataURL(file);
        } else {
            setAttachmentUrl(null);
            setAttachmentName(null);
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
                body: JSON.stringify({ title, content, isImportant, author, category, attachmentUrl, attachmentName })
            });

            if (res.ok) {
                setShowForm(false);
                setTitle("");
                setContent("");
                setCategory("일반 공지");
                setIsImportant(false);
                setAttachmentUrl(null);
                setAttachmentName(null);
                fetchNotices();
            } else {
                alert("공지 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/hr/announcements?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchNotices();
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const parseToDownload = (base64Str: string, fileName: string) => {
        const a = document.createElement("a");
        a.href = base64Str;
        a.download = fileName;
        a.click();
    };

    const filteredNotices = notices.filter(n => activeTab === "전체" ? true : n.category === activeTab);

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <BellRing size={24} color="#3b82f6" /> 사내 공지 및 서식함
                    </h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        인사 관련 매뉴얼, 서식 파일 및 주요 공지사항을 확인하세요.
                    </p>
                </div>
                {canManage && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}
                    >
                        <Plus size={18} /> 새 공지 등록
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "99px",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            border: activeTab === cat ? "none" : "1px solid #d1d5db",
                            backgroundColor: activeTab === cat ? "#1e293b" : "white",
                            color: activeTab === cat ? "white" : "#4b5563",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {showForm && (
                <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "2rem" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>새 공지/서식 작성</h3>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>분류 (카테고리)</label>
                                <select
                                    value={category} onChange={(e) => setCategory(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "1rem" }}
                                >
                                    {categories.filter(c => c !== "전체").map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>제목</label>
                                <input
                                    type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "1rem" }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>내용</label>
                            <textarea
                                value={content} onChange={(e) => setContent(e.target.value)} required rows={5}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "1rem", resize: "vertical" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem", color: "#374151" }}>첨부 파일 (선택, 최대 2MB)</label>
                            <input
                                type="file" onChange={handleFileChange}
                                style={{ width: "100%", padding: "0.5rem", border: "1px dashed #d1d5db", borderRadius: "0.5rem", fontSize: "0.95rem" }}
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
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>우선순위</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>분류</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>제목</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>담당부서</th>
                            <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>첨부파일</th>
                            {canManage && <th style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.85rem", fontWeight: 600 }}>관리</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={canManage ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</td></tr>
                        ) : filteredNotices.length === 0 ? (
                            <tr><td colSpan={canManage ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>조건에 맞는 게시글이 없습니다.</td></tr>
                        ) : (
                            filteredNotices.map((n) => (
                                <tr key={n.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        {n.isImportant ? <span style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.25rem 0.5rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>중요</span> : "-"}
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>
                                        <span style={{ backgroundColor: "#f3f4f6", padding: "0.2rem 0.6rem", borderRadius: "0.25rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{n.category || '일반 공지'}</span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ fontWeight: 500, color: "#111827", marginBottom: "0.25rem" }}>{n.title}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#6b7280", whiteSpace: "pre-wrap" }}>{n.content}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", color: "#6b7280", fontSize: "0.9rem", whiteSpace: "nowrap" }}>{n.author}</td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        {n.attachmentUrl && n.attachmentName ? (
                                            <button
                                                onClick={() => parseToDownload(n.attachmentUrl, n.attachmentName)}
                                                style={{ border: "1px solid #e5e7eb", background: "white", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.8rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", whiteSpace: "nowrap" }}
                                            >
                                                <Download size={14} /> 다운로드
                                            </button>
                                        ) : (
                                            <span style={{ color: "#d1d5db", fontSize: "0.85rem" }}>-</span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <button onClick={() => handleDelete(n.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
