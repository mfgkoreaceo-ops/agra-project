"use client";

import { Plus, Check, X } from "lucide-react";
import "../admin.css";

const mockBanners = [
    { id: 1, title: "Spring Festival Set", type: "Main Banner", active: true },
    { id: 2, title: "Event Pop-up", type: "Modal Popup", active: false },
];

export default function BannerManagement() {
    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">팝업 및 배너</h1>
                    <p className="admin-subtitle">메인 페이지와 헤더에 표시되는 프로모션 이미지를 관리하세요.</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    새 이미지 업로드
                </button>
            </header>

            <div className="card">
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #2d3748", color: "#a0aec0", fontSize: "0.9rem", textTransform: "uppercase" }}>
                            <th style={{ padding: "1rem" }}>제목</th>
                            <th style={{ padding: "1rem" }}>유형</th>
                            <th style={{ padding: "1rem" }}>상태</th>
                            <th style={{ padding: "1rem", textAlign: "right" }}>활성/비활성</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockBanners.map(banner => (
                            <tr key={banner.id} style={{ borderBottom: "1px solid #2d3748" }}>
                                <td style={{ padding: "1rem", fontWeight: "500", color: "#fff" }}>{banner.title}</td>
                                <td style={{ padding: "1rem", color: "#a0aec0" }}>{banner.type}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span style={{
                                        padding: "0.3rem 0.8rem",
                                        background: banner.active ? "rgba(72, 187, 120, 0.2)" : "rgba(229, 62, 62, 0.2)",
                                        color: banner.active ? "#48bb78" : "#e53e3e",
                                        borderRadius: "12px", fontSize: "0.8rem"
                                    }}>
                                        {banner.active ? "활성" : "비활성"}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                    {banner.active ? (
                                        <button style={{ background: "#2d3748", border: "none", color: "#fff", padding: "0.5rem", borderRadius: "4px", cursor: "pointer" }}><X size={16} /></button>
                                    ) : (
                                        <button style={{ background: "var(--gold-primary)", border: "none", color: "#000", padding: "0.5rem", borderRadius: "4px", cursor: "pointer" }}><Check size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
