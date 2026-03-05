"use client";

import { useSettings } from "../../SettingsContext";
import { useState, useEffect } from "react";
import "../admin.css";

const presetThemes = [
    { name: "Classic Gold & Black", bg: "#0a0a0a", gold: "#d4af37" },
    { name: "Royal Emerald", bg: "#022c22", gold: "#facc15" },
    { name: "Midnight Sapphire", bg: "#0f172a", gold: "#38bdf8" },
    { name: "Crimson Palace", bg: "#450a0a", gold: "#fca5a5" },
    { name: "Spice Market", bg: "#271c19", gold: "#f97316" },
    { name: "Taj Marble White", bg: "#f8fafc", gold: "#b45309" },
    { name: "Sunset Orange", bg: "#1a0f00", gold: "#fb923c" },
    { name: "Lotus Pink", bg: "#1f101a", gold: "#f472b6" },
    { name: "Monsoon Grey", bg: "#1e293b", gold: "#cbd5e1" },
    { name: "Modern Minimalist", bg: "#000000", gold: "#ffffff" },
];

const headingFonts = [
    { label: "Playfair Display (기본 영문 명조)", value: "Playfair Display" },
    { label: "Noto Serif KR (본명조)", value: "Noto Serif KR" },
    { label: "Nanum Myeongjo (나눔명조)", value: "Nanum Myeongjo" },
    { label: "Hahmlet (함초롬체 기반 트렌디)", value: "Hahmlet" },
    { label: "Do Hyeon (도현체 - 레트로)", value: "Do Hyeon" },
];

const bodyFonts = [
    { label: "Inter (기본 영문 고딕)", value: "Inter" },
    { label: "Noto Sans KR (본고딕)", value: "Noto Sans KR" },
    { label: "Nanum Gothic (나눔고딕)", value: "Nanum Gothic" },
    { label: "Gowun Dodum (고운돋움 - 단정함)", value: "Gowun Dodum" },
];

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsSaved(false);
    };

    const applyPresetTheme = (bg: string, gold: string) => {
        setFormData(prev => ({ ...prev, backgroundColor: bg, primaryGoldColor: gold }));
        setIsSaved(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleImageUpload = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [name]: reader.result as string }));
                setIsSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const inputStyle = {
        width: "100%", padding: "0.8rem",
        background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff"
    };

    const sectionStyle = { marginBottom: "2rem", borderBottom: "1px solid #2d3748", paddingBottom: "2rem" };
    const labelStyle = { display: "block", color: "var(--gold-primary)", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem" };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">플랫폼 설정</h1>
                    <p className="admin-subtitle">웹사이트 콘텐츠, 이미지, 테마 색상을 사용자 지정하세요.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="dashboard-content" style={{ gridTemplateColumns: "1fr", maxWidth: "800px" }}>
                <div className="card">

                    <div style={sectionStyle}>
                        <h3 className="card-title">브랜드 로고 설정</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>로고 유형</label>
                                <select name="logoType" value={formData.logoType} onChange={handleChange} style={inputStyle}>
                                    <option value="text">텍스트 로고</option>
                                    <option value="image">이미지 로고</option>
                                </select>
                            </div>

                            {formData.logoType === "text" ? (
                                <div>
                                    <label style={labelStyle}>로고 텍스트</label>
                                    <input name="logoText" value={formData.logoText} onChange={handleChange} style={inputStyle} />
                                </div>
                            ) : (
                                <div>
                                    <label style={labelStyle}>로고 이미지 업로드</label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload("logoImageUrl")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                    {formData.logoImageUrl && (
                                        <div style={{ marginTop: "1rem", padding: "1rem", background: "#0f1115", borderRadius: "6px", border: "1px solid #2d3748", display: "inline-block" }}>
                                            <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "0.5rem" }}>미리보기:</p>
                                            <img src={formData.logoImageUrl} alt="Logo Preview" style={{ maxHeight: "50px", objectFit: "contain" }} />
                                        </div>
                                    )}
                                    <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginTop: "0.5rem" }}>이미지 파일을 선택하세요. 브라우저 로컬 저장소에 저장됩니다.</p>
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>푸터 태그라인</label>
                                <input name="footerTagline" value={formData.footerTagline} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">홈페이지 이미지 (업로드)</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>메인 히어로 배경 이미지</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("heroImage")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.heroImage && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.heroImage} alt="Hero Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>시그니처 메뉴 1 이미지 (커리)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("signatureImage1")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.signatureImage1 && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.signatureImage1} alt="Signature 1 Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>시그니처 메뉴 2 이미지 (탄두리)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("signatureImage2")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.signatureImage2 && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.signatureImage2} alt="Signature 2 Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>시그니처 메뉴 3 이미지 (난)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("signatureImage3")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.signatureImage3 && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.signatureImage3} alt="Signature 3 Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">홈페이지 브랜드 철학 섹션</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>제목</label>
                                <input name="philosophyTitle" value={formData.philosophyTitle} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>단락 1</label>
                                <textarea name="philosophyDesc1" value={formData.philosophyDesc1} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px", fontFamily: "var(--font-inter)" }} />
                            </div>
                            <div>
                                <label style={labelStyle}>단락 2</label>
                                <textarea name="philosophyDesc2" value={formData.philosophyDesc2} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px", fontFamily: "var(--font-inter)" }} />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">푸터 연락처 정보</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>주소 (네이버 지도로 자동 연결됨)</label>
                                <input name="contactAddress" value={formData.contactAddress} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>전화번호</label>
                                <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">타이포그래피 (폰트 설정)</h3>
                        <p style={{ fontSize: "0.85rem", color: "#a0aec0", marginBottom: "1.5rem" }}>
                            웹사이트의 영문 및 한글 폰트를 최신 트렌드에 맞게 동적으로 변경합니다. (Google Fonts 자동 적용)
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>제목용 폰트 (Heading)</label>
                                <select name="headingFont" value={formData.headingFont || "Playfair Display"} onChange={handleChange} style={inputStyle}>
                                    {headingFonts.map(font => (
                                        <option key={font.value} value={font.value}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>본문용 폰트 (Body)</label>
                                <select name="bodyFont" value={formData.bodyFont || "Inter"} onChange={handleChange} style={inputStyle}>
                                    {bodyFonts.map(font => (
                                        <option key={font.value} value={font.value}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <h3 className="card-title">테마 색상</h3>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ ...labelStyle, marginBottom: "1rem" }}>프리셋 (10가지 옵션)</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                                {presetThemes.map((theme, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => applyPresetTheme(theme.bg, theme.gold)}
                                        title={theme.name}
                                        style={{
                                            width: "40px", height: "40px", borderRadius: "50%",
                                            background: `linear-gradient(135deg, ${theme.bg} 50%, ${theme.gold} 50%)`,
                                            border: formData.backgroundColor === theme.bg ? "2px solid #fff" : "2px solid transparent",
                                            cursor: "pointer", transition: "transform 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>기본 강조 색상 (사용자 지정)</label>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <input type="color" name="primaryGoldColor" value={formData.primaryGoldColor} onChange={handleChange} style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="primaryGoldColor" value={formData.primaryGoldColor} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace" }} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>글로벌 배경 색상 (사용자 지정)</label>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button type="submit" className="btn-primary" style={{ padding: "0.8rem 2rem" }}>
                            웹사이트 설정 저장
                        </button>
                        {isSaved && <span style={{ color: "#48bb78", fontSize: "0.9rem", fontWeight: 500 }}>✅ 설정이 성공적으로 업데이트되었습니다!</span>}
                    </div>

                </div>
            </form>
        </div>
    );
}
