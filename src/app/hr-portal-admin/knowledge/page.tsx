"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, PlusCircle, Search, FileText, Edit2, Save } from "lucide-react";

type KnowledgeDoc = {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
};

export default function KnowledgePage() {
    const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Editing state
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editContent, setEditContent] = useState("");

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("전사 규정");
    const [content, setContent] = useState("");
    const [user, setUser] = useState<any>(null);

    const fetchDocs = async () => {
        try {
            const res = await fetch("/api/hr/knowledge");
            const data = await res.json();
            setDocs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load Knowledge docs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("hr_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchDocs();
    }, []);

    const allowedRoles = ["HR_ADMIN", "HQ_TEAM_LEADER", "HQ_STAFF", "HEAD_OF_MANAGEMENT"];

    if (user && !allowedRoles.includes(user.role)) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
                <h2>접근 권한이 없습니다</h2>
                <p>신규 지식 베이스 문서는 본사 인사팀 및 관리팀만 등록할 수 있습니다.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !category) return alert("모든 필드를 입력해주세요.");

        try {
            const res = await fetch("/api/hr/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, category })
            });

            if (res.ok) {
                alert("성공적으로 등록되었습니다. (실제 챗봇 벡터 DB 연동은 다음 페이즈에서 진행됩니다)");
                setTitle("");
                setContent("");
                setIsFormOpen(false);
                fetchDocs();
            } else {
                alert("문서 등록 실패");
            }
        } catch (error) {
            console.error(error);
            alert("서버 연결 오류");
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editTitle || !editContent || !editCategory) return alert("모든 필드를 입력해주세요.");
        try {
            const res = await fetch("/api/hr/knowledge", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, title: editTitle, content: editContent, category: editCategory })
            });

            if (res.ok) {
                alert("수정되었습니다.");
                setEditingDocId(null);
                fetchDocs();
            } else {
                alert("수정 실패");
            }
        } catch (error) {
            console.error(error);
            alert("서버 연결 오류");
        }
    };

    const filteredDocs = docs.filter(doc =>
        doc.title.includes(searchTerm) ||
        doc.content.includes(searchTerm) ||
        doc.category.includes(searchTerm)
    );

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>HR 챗봇 지식 베이스 편집</h1>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>
                        직원들이 챗봇에게 질문할 취업규칙, 노무, 연차 규정 데이터베이스 관리
                    </p>
                </div>

                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", backgroundColor: "#1e3a8a", border: "none", borderRadius: "0.5rem", color: "white", cursor: "pointer", fontWeight: 500 }}
                >
                    <PlusCircle size={16} /> 신규 문서 등록
                </button>
            </div>

            {isFormOpen && (
                <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.75rem", border: "1px solid #d1d5db", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#111827" }}>
                        <FileText size={20} color="#1e3a8a" /> 챗봇 AI 학습용 문서 추가
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>카테고리</label>
                                <select
                                    value={category} onChange={(e) => setCategory(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                                >
                                    <option value="전사 규정">전사 규정</option>
                                    <option value="근태/연차">근태/연차</option>
                                    <option value="급여/보상">급여/보상</option>
                                    <option value="복리후생">복리후생</option>
                                    <option value="직접 입력">➕ 직접 입력</option>
                                </select>
                                {category === "직접 입력" && (
                                    <input
                                        type="text"
                                        placeholder="새 카테고리명 입력"
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{ width: "100%", padding: "0.75rem", border: "1px solid #10b981", borderRadius: "0.5rem", outline: "none", marginTop: "0.5rem" }}
                                        required
                                    />
                                )}
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>문서 제목 (질문 키워드)</label>
                                <input
                                    type="text"
                                    placeholder="예: 2026년 기준 연차 발생 기준 안내"
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>답변 내용 (AI가 학습할 구체적인 텍스트)</label>
                            <textarea
                                rows={6}
                                placeholder="챗봇이 이 내용을 바탕으로 사용자에게 답변을 생성합니다. 줄글로 자세히 적어주세요."
                                value={content} onChange={(e) => setContent(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none", resize: "vertical" }}
                                required
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "0.5rem", color: "#374151", cursor: "pointer", fontWeight: 500 }}>취소</button>
                            <button type="submit" style={{ padding: "0.6rem 1.5rem", backgroundColor: "#1e3a8a", border: "none", borderRadius: "0.5rem", color: "white", cursor: "pointer", fontWeight: 500 }}>DB 업로드 및 AI 모델 적용</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} size={18} />
                    <input
                        type="text"
                        placeholder="문서 제목 또는 내용 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", outline: "none" }}
                    />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loading ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>로딩 중...</div>
                ) : filteredDocs.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", backgroundColor: "white", borderRadius: "0.75rem", border: "1px dashed #d1d5db" }}>
                        <MessageSquare size={36} color="#9ca3af" style={{ margin: "0 auto 1rem auto" }} />
                        <p style={{ color: "#6b7280" }}>등록된 지식 베이스 문서가 없습니다.</p>
                    </div>
                ) : (
                    filteredDocs.map(doc => {
                        const isEditing = editingDocId === doc.id;
                        return (
                            <div key={doc.id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {isEditing ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        <input
                                            type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                                            style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", fontSize: "0.85rem", width: "150px" }}
                                        />
                                        <input
                                            type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                            style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", fontSize: "1.1rem", fontWeight: 600, width: "100%" }}
                                        />
                                        <textarea
                                            value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6}
                                            style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", fontSize: "0.95rem", width: "100%", resize: "vertical" }}
                                        />
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button onClick={() => setEditingDocId(null)} style={{ padding: "0.4rem 1rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", border: "none", cursor: "pointer" }}>취소</button>
                                            <button onClick={() => handleUpdate(doc.id)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", backgroundColor: "#10b981", color: "white", borderRadius: "0.25rem", border: "none", cursor: "pointer" }}>
                                                <Save size={14} /> 저장
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                                                    {doc.category}
                                                </span>
                                                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827", fontWeight: 600 }}>{doc.title}</h3>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                                {user && allowedRoles.includes(user.role) && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingDocId(doc.id);
                                                            setEditTitle(doc.title);
                                                            setEditCategory(doc.category);
                                                            setEditContent(doc.content);
                                                        }}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.85rem" }}
                                                    >
                                                        <Edit2 size={14} /> 수정
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p style={{ margin: "0.5rem 0 0 0", color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                            {doc.content}
                                        </p>
                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}
