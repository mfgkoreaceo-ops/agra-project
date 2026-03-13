"use client";

import { useSettings } from "../../SettingsContext";
import { useState, useEffect } from "react";
import "../admin.css";

export default function BannersPage() {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState({
        isPromotionActive: settings.isPromotionActive || false,
        promotionImage: settings.promotionImage || "",
        promotionLink: settings.promotionLink || ""
    });
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData({
            isPromotionActive: settings.isPromotionActive || false,
            promotionImage: settings.promotionImage || "",
            promotionLink: settings.promotionLink || ""
        });
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setIsSaved(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, promotionImage: reader.result as string }));
                setIsSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const inputStyle = {
        width: "100%", padding: "0.8rem",
        background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff"
    };
    const labelStyle = { display: "block", color: "var(--gold-primary)", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem" };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">팝업 관리</h1>
                    <p className="admin-subtitle">메인 화면 접속 시 노출되는 프로모션 팝업을 설정합니다.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="dashboard-content" style={{ gridTemplateColumns: "1fr", maxWidth: "800px" }}>
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: "2rem", borderBottom: "1px solid #2d3748", paddingBottom: "1rem" }}>프로모션 팝업 설정</h3>

                    <div style={{ display: "grid", gap: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>팝업 활성화 여부</label>
                            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                                <input
                                    type="checkbox"
                                    name="isPromotionActive"
                                    checked={formData.isPromotionActive}
                                    onChange={handleChange}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: formData.isPromotionActive ? "var(--gold-primary)" : "#2d3748",
                                    transition: ".4s", borderRadius: "34px", display: "flex", alignItems: "center",
                                    padding: "0 4px"
                                }}>
                                    <span style={{
                                        position: "absolute", height: "18px", width: "18px", left: formData.isPromotionActive ? "28px" : "3px",
                                        backgroundColor: "white", transition: ".4s", borderRadius: "50%"
                                    }} />
                                </span>
                            </label>
                            <span style={{ color: formData.isPromotionActive ? "var(--gold-primary)" : "#a0a0a0", fontSize: "0.9rem", fontWeight: 600 }}>
                                {formData.isPromotionActive ? "노출 중" : "비활성화 고정"}
                            </span>
                        </div>

                        <div>
                            <label style={labelStyle}>팝업 이미지</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: "0.5rem" }} disabled={!formData.isPromotionActive} />
                            {formData.promotionImage && (
                                <div style={{ marginTop: "1rem", padding: "1rem", background: "#0f1115", borderRadius: "6px", border: "1px solid #2d3748", display: "inline-block" }}>
                                    <img src={formData.promotionImage} alt="Promotion Preview" style={{ maxHeight: "200px", objectFit: "contain", borderRadius: "4px" }} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>링크 URL (선택)</label>
                            <input name="promotionLink" value={formData.promotionLink} onChange={handleChange} style={inputStyle} disabled={!formData.isPromotionActive} placeholder="예) /menu 또는 https://..." />
                        </div>
                    </div>

                    <div style={{ marginTop: "3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button type="submit" className="btn-primary" style={{ padding: "0.8rem 2rem" }}>
                            설정 적용
                        </button>
                        {isSaved && <span style={{ color: "#48bb78", fontSize: "0.9rem", fontWeight: 500 }}>✅ 팝업이 적용되었습니다. 메인페이지를 새로고침 해보세요!</span>}
                    </div>
                </div>
            </form>
        </div>
    );
}
