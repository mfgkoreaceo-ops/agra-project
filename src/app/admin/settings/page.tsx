"use client";

import { useSettings } from "../../SettingsContext";
import { useState, useEffect } from "react";
import "../admin.css";

const backgroundPalette = [
    "#000000", "#0a0a0a", "#111827", "#171717", "#0f172a",
    "#1e1b4b", "#022c22", "#450a0a", "#271c19", "#f8fafc"
];

const goldPalette = [
    "#d4af37", "#facc15", "#38bdf8", "#fca5a5", "#f97316",
    "#b45309", "#f472b6", "#cbd5e1", "#ffffff", "#10b981"
];

const allAvailableFonts = [
    // Serifs / Myeongjo
    { label: "Playfair Display (기본 영문 명조)", value: "Playfair Display" },
    { label: "Noto Serif KR (본명조)", value: "Noto Serif KR" },
    { label: "Nanum Myeongjo (나눔명조)", value: "Nanum Myeongjo" },
    { label: "Hahmlet (함초롬체 기반 트렌디)", value: "Hahmlet" },
    { label: "Cinzel (우아한 영문 디스플레이)", value: "Cinzel" },
    { label: "Lora (부드러운 세리프)", value: "Lora" },
    { label: "Merriweather (가독성 높은 세리프)", value: "Merriweather" },
    { label: "Gowun Batang (고운바탕)", value: "Gowun Batang" },

    // Sans-Serifs / Gothic / Decorative
    { label: "Inter (기본 영문 고딕)", value: "Inter" },
    { label: "Noto Sans KR (본고딕)", value: "Noto Sans KR" },
    { label: "Nanum Gothic (나눔고딕)", value: "Nanum Gothic" },
    { label: "Gowun Dodum (고운돋움 - 단정함)", value: "Gowun Dodum" },
    { label: "Roboto (대중적인 고딕)", value: "Roboto" },
    { label: "Open Sans (친근한 고딕)", value: "Open Sans" },
    { label: "Montserrat (지오메트릭 고딕)", value: "Montserrat" },
    { label: "IBM Plex Sans KR (깔끔한 산세리프)", value: "IBM Plex Sans KR" },

    // Retro / Special
    { label: "Do Hyeon (도현체 - 레트로)", value: "Do Hyeon" },
    { label: "Song Myung (송명 - 붓글씨 느낌)", value: "Song Myung" },
];

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    useEffect(() => {
        // Load fonts for preview in dropdowns
        const allFonts = Array.from(new Set(allAvailableFonts.map(f => f.value.replace(/ /g, "+"))));
        const fontUrl = `https://fonts.googleapis.com/css2?family=${allFonts.join("&family=")}&display=swap`;

        let linkTag = document.getElementById('admin-preview-fonts') as HTMLLinkElement;
        if (!linkTag) {
            linkTag = document.createElement('link');
            linkTag.id = 'admin-preview-fonts';
            linkTag.rel = 'stylesheet';
            document.head.appendChild(linkTag);
        }
        if (linkTag.href !== fontUrl) {
            linkTag.href = fontUrl;
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleMultiImageUpload = (name: "heroImages") => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    [name]: [...(prev[name] || []), reader.result as string]
                }));
                setIsSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeMultiImage = (name: "heroImages", index: number) => {
        setFormData(prev => {
            const newArray = [...(prev[name] || [])];
            newArray.splice(index, 1);
            return { ...prev, [name]: newArray };
        });
        setIsSaved(false);
    };

    const inputStyle = {
        width: "100%", padding: "0.8rem",
        background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff"
    };

    const sectionStyle = { marginBottom: "2rem", borderBottom: "1px solid #2d3748", paddingBottom: "2rem" };
    const labelStyle = { display: "block", color: "#d4af37", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem" };

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
                                <select name="logoType" value={formData.logoType || "text"} onChange={handleChange} style={inputStyle}>
                                    <option value="text">텍스트 로고</option>
                                    <option value="image">이미지 로고</option>
                                </select>
                            </div>

                            {formData.logoType === "text" ? (
                                <div>
                                    <label style={labelStyle}>로고 텍스트</label>
                                    <input name="logoText" value={formData.logoText || ""} onChange={handleChange} style={inputStyle} />
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
                                <input name="footerTagline" value={formData.footerTagline || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">홈페이지 메인 텍스트 (히어로 영역)</h3>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>작은 부제목 (Subtitle)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                            <div style={{ gridColumn: "1 / -1", marginBottom: "-0.5rem" }}>
                                <input name="heroSubtitle" value={formData.heroSubtitle || ""} onChange={handleChange} style={inputStyle} placeholder="WELCOME TO" />
                            </div>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="heroSubtitleFont" value={formData.heroSubtitleFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.heroSubtitleFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="heroSubtitleFontSize" value={formData.heroSubtitleFontSize || "0.9rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 0.9rem, 14px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="heroSubtitleColor" value={formData.heroSubtitleColor?.startsWith('#') ? formData.heroSubtitleColor : '#d4af37'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="heroSubtitleColor" value={formData.heroSubtitleColor || "#d4af37"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>메인 큰 제목 (Title)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                            <div style={{ gridColumn: "1 / -1", marginBottom: "-0.5rem" }}>
                                <textarea name="heroTitle" value={formData.heroTitle || ""} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px", fontFamily: "var(--font-playfair)" }} placeholder="The Authentic Taste of India" />
                            </div>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="heroTitleFont" value={formData.heroTitleFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.heroTitleFont}', serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="heroTitleFontSize" value={formData.heroTitleFontSize || "5.2rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 5.2rem, 80px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="heroTitleColor" value={formData.heroTitleColor?.startsWith('#') ? formData.heroTitleColor : '#ffffff'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="heroTitleColor" value={formData.heroTitleColor || "#ffffff"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>설명글 (Description)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                            <div style={{ gridColumn: "1 / -1", marginBottom: "-0.5rem" }}>
                                <textarea name="heroDesc" value={formData.heroDesc || ""} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px", fontFamily: "var(--font-inter)" }} placeholder="Experience the royal flavors..." />
                            </div>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="heroDescFont" value={formData.heroDescFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.heroDescFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="heroDescFontSize" value={formData.heroDescFontSize || "1.1rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 1.1rem, 16px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="heroDescColor" value={formData.heroDescColor?.startsWith('#') ? formData.heroDescColor : '#e2e8f0'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="heroDescColor" value={formData.heroDescColor || "#e2e8f0"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "2rem" }}>EXPLORE MENU 버튼 (Button)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="heroBtnFont" value={formData.heroBtnFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.heroBtnFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="heroBtnColor" value={formData.heroBtnColor?.startsWith('#') ? formData.heroBtnColor : '#d4af37'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="heroBtnColor" value={formData.heroBtnColor || "#d4af37"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">홈페이지 메인 이미지 (업로드)</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>메인 히어로 배경 이미지 (롤링 슬라이드)</label>
                                <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "0.5rem" }}>이미지를 여러 개 등록하면 메인 화면에서 순서대로 전환됩니다.</p>
                                <p style={{ fontSize: "0.85rem", color: "#d4af37", marginBottom: "1rem" }}>💡 권장 사이즈: 1920x1080px (16:9 비율) / 고해상도 이미지 권장</p>

                                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                                    {(formData.heroImages || []).map((imgUrl, idx) => (
                                        <div key={idx} style={{ position: "relative", width: "120px", height: "80px" }}>
                                            <img src={imgUrl} alt={`Hero ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", border: "1px solid #2d3748" }} />
                                            <button
                                                type="button"
                                                onClick={() => removeMultiImage("heroImages", idx)}
                                                style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", padding: 0 }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input type="file" accept="image/*" onChange={handleMultiImageUpload("heroImages")} style={{ ...inputStyle, padding: "0.5rem" }} />
                            </div>
                            <div style={{ border: "1px solid #2d3748", padding: "1.5rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "1rem" }}>시그니처 메뉴 1</h4>
                                <label style={labelStyle}>메뉴 이름</label>
                                <input name="signatureName1" value={formData.signatureName1 || ""} onChange={handleChange} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="e.g. Butter Chicken" />
                                <label style={labelStyle}>메뉴 설명</label>
                                <input name="signatureDesc1" value={formData.signatureDesc1 || ""} onChange={handleChange} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="e.g. Rich Tomato Curry" />
                                <label style={labelStyle}>메뉴 이미지</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("signatureImage1")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.signatureImage1 && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.signatureImage1} alt="Signature 1 Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ border: "1px solid #2d3748", padding: "1.5rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "1rem" }}>시그니처 메뉴 2</h4>
                                <label style={labelStyle}>메뉴 이름</label>
                                <input name="signatureName2" value={formData.signatureName2 || ""} onChange={handleChange} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="e.g. Tandoori Chicken" />
                                <label style={labelStyle}>메뉴 설명</label>
                                <input name="signatureDesc2" value={formData.signatureDesc2 || ""} onChange={handleChange} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="e.g. Clay Oven Roasted" />
                                <label style={labelStyle}>메뉴 이미지</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("signatureImage2")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.signatureImage2 && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.signatureImage2} alt="Signature 2 Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ border: "1px solid #2d3748", padding: "1.5rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "1rem" }}>시그니처 메뉴 3</h4>
                                <label style={labelStyle}>메뉴 이름</label>
                                <input name="signatureName3" value={formData.signatureName3 || ""} onChange={handleChange} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="e.g. Garlic Naan" />
                                <label style={labelStyle}>메뉴 설명</label>
                                <input name="signatureDesc3" value={formData.signatureDesc3 || ""} onChange={handleChange} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="e.g. Fresh Baked Bread" />
                                <label style={labelStyle}>메뉴 이미지</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload("signatureImage3")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.signatureImage3 && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.signatureImage3} alt="Signature 3 Preview" style={{ maxHeight: "60px", borderRadius: "4px", objectFit: "cover" }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>시그니처 메뉴 섹션 타이틀</label>
                                <input name="signatureTitle" value={formData.signatureTitle ?? ""} onChange={handleChange} style={inputStyle} placeholder="Signature Dishes" />
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <h4 style={{ color: "#d4af37", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "1rem" }}>시그니처 타이틀 텍스트 스타일 지정</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                    <div>
                                        <label style={labelStyle}>글씨체 (Font)</label>
                                        <select name="signatureFont" value={formData.signatureFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.signatureFont}', serif` }}>
                                            {allAvailableFonts.map(font => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>섹션 타이틀 크기 (Size)</label>
                                        <input name="signatureFontSize" value={formData.signatureFontSize || "2.5rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 2.5rem, 40px" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>섹션 타이틀 색상 (Color)</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input type="color" name="signatureColor" value={formData.signatureColor?.startsWith('#') ? formData.signatureColor.substring(0, 7) : '#fdfdfd'} onChange={handleChange} title="HEX 색상 전용 피커" style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                            <input name="signatureColor" value={formData.signatureColor || "#fdfdfd"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} placeholder="e.g. #fdfdfd" />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "0.5rem" }}>
                                        <div>
                                            <label style={labelStyle}>메뉴 이름 색상 (Name Color)</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input type="color" name="signatureNameColor" value={formData.signatureNameColor?.startsWith('#') ? formData.signatureNameColor.substring(0, 7) : '#fdfdfd'} onChange={handleChange} title="HEX 색상 전용 피커" style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                                <input name="signatureNameColor" value={formData.signatureNameColor || "#fdfdfd"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} placeholder="e.g. #fdfdfd" />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>메뉴 설명 색상 (Desc Color)</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input type="color" name="signatureDescColor" value={formData.signatureDescColor?.startsWith('#') ? formData.signatureDescColor.substring(0, 7) : '#fdfdfd'} onChange={handleChange} title="HEX 색상 전용 피커" style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                                <input name="signatureDescColor" value={formData.signatureDescColor || "#fdfdfd"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} placeholder="e.g. #fdfdfd" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h4 style={{ color: "#d4af37", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "2rem" }}>시그니처 영역 전체 배경색 지정</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                                    <div>
                                        <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "0.5rem" }}>시그니처 디쉬 영역을 감싸는 전체 뒷배경 색상입니다. 그라데이션, `transparent` 또는 HEX, RGBA 값을 자유롭게 입력할 수 있습니다.</p>
                                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                            <input type="color" name="signatureBgColor" value={formData.signatureBgColor?.startsWith('#') ? formData.signatureBgColor : '#0f1115'} onChange={handleChange} title="HEX 색상 전용 피커" style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                            <input name="signatureBgColor" value={formData.signatureBgColor || "var(--surface-dark)"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} placeholder="e.g. #0f1115, var(--surface-dark)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">홈페이지 브랜드 철학 섹션</h3>
                        <div style={{ display: "grid", gap: "1.5rem", marginBottom: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>문단 정렬 옵션 (Alignment)</label>
                                <select name="philosophyTextAlign" value={formData.philosophyTextAlign || "left"} onChange={handleChange} style={inputStyle}>
                                    <option value="left">좌측 정렬 (Left)</option>
                                    <option value="center">중앙 정렬 (Center)</option>
                                    <option value="right">우측 정렬 (Right)</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>제목</label>
                                <input name="philosophyTitle" value={formData.philosophyTitle || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>단락 1</label>
                                <textarea name="philosophyDesc1" value={formData.philosophyDesc1 || ""} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px", fontFamily: "var(--font-inter)" }} />
                            </div>
                            <div>
                                <label style={labelStyle}>단락 2</label>
                                <textarea name="philosophyDesc2" value={formData.philosophyDesc2 || ""} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px", fontFamily: "var(--font-inter)" }} />
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>제목 (Title) 텍스트 스타일</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="philosophyTitleFont" value={formData.philosophyTitleFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.philosophyTitleFont}', serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="philosophyTitleFontSize" value={formData.philosophyTitleFontSize || "2.5rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 2.5rem, 40px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="philosophyTitleColor" value={formData.philosophyTitleColor?.startsWith('#') ? formData.philosophyTitleColor : '#fdfdfd'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="philosophyTitleColor" value={formData.philosophyTitleColor || "#fdfdfd"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>설명글 (Description) 텍스트 스타일</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="philosophyDescFont" value={formData.philosophyDescFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.philosophyDescFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="philosophyDescFontSize" value={formData.philosophyDescFontSize || "1.1rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 1.1rem, 16px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="philosophyDescColor" value={formData.philosophyDescColor?.startsWith('#') ? formData.philosophyDescColor : '#fdfdfd'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="philosophyDescColor" value={formData.philosophyDescColor || "#fdfdfd"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "2rem" }}>철학 섹션 이미지 (우측 표시)</h4>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>이미지 업로드</label>
                                <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "0.5rem" }}>철학 내용 옆에 표시될 관련 사진을 업로드하세요. (권장: 주제와 어울리는 분위기 있는 사진)</p>
                                <input type="file" accept="image/*" onChange={handleImageUpload("philosophyImage")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                {formData.philosophyImage && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <img src={formData.philosophyImage} alt="Philosophy Preview" style={{ maxHeight: "150px", borderRadius: "4px", objectFit: "cover", border: "1px solid #2d3748" }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">메뉴 페이지 (Menu Page) 커스텀</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>메뉴 페이지 제목 (Title)</label>
                                <input name="menuTitle" value={formData.menuTitle || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>메뉴 페이지 부제목 (Subtitle)</label>
                                <input name="menuSubtitle" value={formData.menuSubtitle || ""} onChange={handleChange} style={inputStyle} />
                            </div>

                            <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "1rem" }}>메뉴 제목 텍스트 스타일</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>폰트 (Font)</label>
                                    <select name="menuFont" value={formData.menuFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.menuFont}', serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>크기 (Size)</label>
                                    <input name="menuFontSize" value={formData.menuFontSize || "3.5rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 3.5rem, 40px" />
                                </div>
                                <div>
                                    <label style={labelStyle}>색상 (Color)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuColor" value={formData.menuColor?.startsWith('#') ? formData.menuColor : '#fdfdfd'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuColor" value={formData.menuColor || "#fdfdfd"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "2rem" }}>메뉴 개별 카드 디자인 (메뉴 이름)</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                                <div>
                                    <label style={labelStyle}>메뉴명 글씨체 (Font)</label>
                                    <select name="menuItemNameFont" value={formData.menuItemNameFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.menuItemNameFont}', sans-serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>메뉴명 폰트 크기</label>
                                    <input name="menuItemNameFontSize" value={formData.menuItemNameFontSize || "1.3rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 1.3rem, 18px" />
                                </div>
                                <div>
                                    <label style={labelStyle}>메뉴명 색상</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuItemNameColor" value={formData.menuItemNameColor?.startsWith('#') ? formData.menuItemNameColor : '#ffffff'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuItemNameColor" value={formData.menuItemNameColor || "#ffffff"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem", marginTop: "2rem" }}>메인 뱃지 (Best, Spicy, Halal 등) 디자인 지정</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>뱃지 공통 폰트 (Font)</label>
                                    <select name="badgeFont" value={formData.badgeFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.badgeFont}', sans-serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>뱃지 공통 폰트 크기</label>
                                    <input name="badgeFontSize" value={formData.badgeFontSize || "0.8rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 0.8rem, 12px" />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                <div style={{ border: "1px solid #2d3748", padding: "1rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                                    <p style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "1rem", fontSize: "0.95rem" }}>Best ⭐ 뱃지 색상</p>
                                    <label style={labelStyle}>배경색 (Background)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                                        <input type="color" name="badgeBestBgColor" value={formData.badgeBestBgColor?.startsWith('#') ? formData.badgeBestBgColor : '#d4af37'} onChange={handleChange} style={{ width: "35px", height: "35px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        <input name="badgeBestBgColor" value={formData.badgeBestBgColor || "#d4af37"} onChange={handleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                    </div>
                                    <label style={labelStyle}>글씨색 (Text)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="badgeBestTextColor" value={formData.badgeBestTextColor?.startsWith('#') ? formData.badgeBestTextColor : '#000000'} onChange={handleChange} style={{ width: "35px", height: "35px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        <input name="badgeBestTextColor" value={formData.badgeBestTextColor || "#000000"} onChange={handleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                    </div>
                                </div>

                                <div style={{ border: "1px solid #2d3748", padding: "1rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                                    <p style={{ color: "#e53e3e", fontWeight: "bold", marginBottom: "1rem", fontSize: "0.95rem" }}>Spicy 🌶️ 뱃지 색상</p>
                                    <label style={labelStyle}>배경색 (Background)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                                        <input type="color" name="badgeSpicyBgColor" value={formData.badgeSpicyBgColor?.startsWith('#') ? formData.badgeSpicyBgColor : '#e53e3e'} onChange={handleChange} style={{ width: "35px", height: "35px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        <input name="badgeSpicyBgColor" value={formData.badgeSpicyBgColor || "#e53e3e"} onChange={handleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                    </div>
                                    <label style={labelStyle}>글씨색 (Text)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="badgeSpicyTextColor" value={formData.badgeSpicyTextColor?.startsWith('#') ? formData.badgeSpicyTextColor : '#ffffff'} onChange={handleChange} style={{ width: "35px", height: "35px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        <input name="badgeSpicyTextColor" value={formData.badgeSpicyTextColor || "#ffffff"} onChange={handleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                    </div>
                                </div>

                                <div style={{ border: "1px solid #2d3748", padding: "1rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                                    <p style={{ color: "#38a169", fontWeight: "bold", marginBottom: "1rem", fontSize: "0.95rem" }}>Halal 🌿 뱃지 색상</p>
                                    <label style={labelStyle}>배경색 (Background)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                                        <input type="color" name="badgeHalalBgColor" value={formData.badgeHalalBgColor?.startsWith('#') ? formData.badgeHalalBgColor : '#38a169'} onChange={handleChange} style={{ width: "35px", height: "35px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        <input name="badgeHalalBgColor" value={formData.badgeHalalBgColor || "#38a169"} onChange={handleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                    </div>
                                    <label style={labelStyle}>글씨색 (Text)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="badgeHalalTextColor" value={formData.badgeHalalTextColor?.startsWith('#') ? formData.badgeHalalTextColor : '#ffffff'} onChange={handleChange} style={{ width: "35px", height: "35px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        <input name="badgeHalalTextColor" value={formData.badgeHalalTextColor || "#ffffff"} onChange={handleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">이벤트 및 프로모션 관리</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <input
                                    type="checkbox"
                                    name="isPromotionActive"
                                    checked={formData.isPromotionActive || false}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPromotionActive: e.target.checked }))}
                                    style={{ width: "20px", height: "20px", accentColor: "#d4af37", cursor: "pointer" }}
                                    id="promo-toggle"
                                />
                                <label htmlFor="promo-toggle" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>홈페이지 메인 팝업 배너 활성화</label>
                            </div>

                            {formData.isPromotionActive && (
                                <>
                                    <div>
                                        <label style={labelStyle}>프로모션 배너 이미지</label>
                                        <input type="file" accept="image/*" onChange={handleImageUpload("promotionImage")} style={{ ...inputStyle, padding: "0.5rem" }} />
                                        {formData.promotionImage && (
                                            <div style={{ marginTop: "0.5rem" }}>
                                                <img src={formData.promotionImage} alt="Promotion Preview" style={{ maxHeight: "150px", borderRadius: "4px", objectFit: "cover", border: "1px solid #2d3748" }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>배너 클릭 시 이동할 링크 URL</label>
                                        <input name="promotionLink" value={formData.promotionLink || ""} onChange={handleChange} style={inputStyle} placeholder="https://..." />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">푸터 연락처 정보</h3>
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>주소 (네이버 지도로 자동 연결됨)</label>
                                <input name="contactAddress" value={formData.contactAddress || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>전화번호</label>
                                <input name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 className="card-title">타이포그래피 및 레이아웃 텍스트 설정</h3>
                        <p style={{ fontSize: "0.85rem", color: "#a0aec0", marginBottom: "1.5rem" }}>
                            웹사이트의 영문 및 한글 폰트를 최신 트렌드에 맞게 동적으로 변경합니다. (Google Fonts 자동 적용)
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div>
                                <label style={labelStyle}>제목용 폰트 (Heading)</label>
                                <select name="headingFont" value={formData.headingFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.headingFont}', serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>본문용 폰트 (Body)</label>
                                <select name="bodyFont" value={formData.bodyFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.bodyFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>상단 메뉴바 (Header) 텍스트 스타일</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="headerFont" value={formData.headerFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.headerFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="headerFontSize" value={formData.headerFontSize || "0.9rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 0.9rem, 14px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="headerColor" value={formData.headerColor?.startsWith('#') ? formData.headerColor : '#ffffff'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="headerColor" value={formData.headerColor || "#ffffff"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>푸터 로고 이미지 (선택)</h4>
                        <div style={{ marginBottom: "2rem" }}>
                            <label style={labelStyle}>하단 푸터 전용 로고 업로드 (이미지 로고 사용 시)</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload("footerLogoImageUrl")} style={{ ...inputStyle, padding: "0.5rem" }} />
                            {formData.footerLogoImageUrl && (
                                <div style={{ marginTop: "1rem", padding: "1rem", background: "#0f1115", borderRadius: "6px", border: "1px solid #2d3748", display: "inline-block" }}>
                                    <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "0.5rem" }}>미리보기:</p>
                                    <img src={formData.footerLogoImageUrl} alt="Footer Logo Preview" style={{ maxHeight: "50px", objectFit: "contain" }} />
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <button onClick={() => setFormData({ ...formData, footerLogoImageUrl: "" })} style={{ background: "transparent", color: "#ed8936", border: "none", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>
                                            이미지 초기화 (상단 로고 사용)
                                        </button>
                                    </div>
                                </div>
                            )}
                            <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginTop: "0.5rem" }}>등록하지 않으면 메인 로고가 사용됩니다.</p>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>태그라인 텍스트 설정 (로고 하단)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div>
                                <label style={labelStyle}>태그라인 내용</label>
                                <input name="footerTagline" value={formData.footerTagline || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="footerTaglineFont" value={formData.footerTaglineFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.footerTaglineFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="footerTaglineFontSize" value={formData.footerTaglineFontSize || "0.9rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 0.9rem, 14px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="footerTaglineColor" value={formData.footerTaglineColor?.startsWith('#') ? formData.footerTaglineColor.substring(0, 7) : '#888888'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="footerTaglineColor" value={formData.footerTaglineColor || "#888888"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>푸터 항목 타이틀 (Company, Contact)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div style={{ gridColumn: "1 / 3", display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>컴퍼니 타이틀 워딩</label>
                                    <input name="footerCompanyTitle" value={formData.footerCompanyTitle ?? ""} onChange={handleChange} style={inputStyle} placeholder="Company" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>컨택트 타이틀 워딩</label>
                                    <input name="footerContactTitle" value={formData.footerContactTitle ?? ""} onChange={handleChange} style={inputStyle} placeholder="Contact" />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="footerTitleFont" value={formData.footerTitleFont || "Playfair Display"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.footerTitleFont}', serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="footerTitleFontSize" value={formData.footerTitleFontSize || "1rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 1rem" />
                            </div>
                            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem", alignItems: "center", marginBottom: "-1rem" }}>
                                <label style={{ ...labelStyle, marginBottom: 0, minWidth: "120px" }}>타이틀 색상 (Color)</label>
                                <input type="color" name="footerTitleColor" value={formData.footerTitleColor?.startsWith('#') ? formData.footerTitleColor.substring(0, 7) : '#ffffff'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                <input name="footerTitleColor" value={formData.footerTitleColor || "#ffffff"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff", maxWidth: "150px" }} />
                            </div>
                        </div>

                        <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95em", borderBottom: "1px dashed #2d3748", paddingBottom: "0.5rem" }}>푸터 일반 텍스트 및 링크 스타일</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>폰트 (Font)</label>
                                <select name="footerFont" value={formData.footerFont || "Inter"} onChange={handleChange} style={{ ...inputStyle, fontFamily: `'${formData.footerFont}', sans-serif` }}>
                                    {allAvailableFonts.map(font => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>크기 (Size)</label>
                                <input name="footerFontSize" value={formData.footerFontSize || "0.9rem"} onChange={handleChange} style={inputStyle} placeholder="e.g. 0.9rem, 14px" />
                            </div>
                            <div>
                                <label style={labelStyle}>색상 (Color)</label>
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <input type="color" name="footerColor" value={formData.footerColor?.startsWith('#') ? formData.footerColor.substring(0, 7) : '#888888'} onChange={handleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="footerColor" value={formData.footerColor || "#888888"} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...sectionStyle, borderBottom: "none" }}>
                        <h3 className="card-title">테마 색상 팔레트 및 사용자 지정</h3>
                        <p style={{ fontSize: "0.85rem", color: "#a0aec0", marginBottom: "1.5rem" }}>
                            아래 팔레트 색상을 직접 클릭하거나, 우측 컬러 피커로 원하는 색상과 색상 코드를 직접 지정할 수 있습니다.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            <div>
                                <label style={labelStyle}>기본 강조 색상 (Primary Color)</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                                    {goldPalette.map((color, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleChange({ target: { name: 'primaryGoldColor', value: color } } as any)}
                                            style={{
                                                width: "32px", height: "32px", borderRadius: "50%",
                                                backgroundColor: color,
                                                border: formData.primaryGoldColor === color ? "3px solid #fff" : "1px solid #2d3748",
                                                boxShadow: formData.primaryGoldColor === color ? "0 0 10px rgba(255,255,255,0.4)" : "none",
                                                cursor: "pointer", transition: "all 0.2s ease"
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <input type="color" name="primaryGoldColor" value={formData.primaryGoldColor} onChange={handleChange} style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="primaryGoldColor" value={formData.primaryGoldColor} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace" }} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>글로벌 배경 색상 (Background Color)</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                                    {backgroundPalette.map((color, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleChange({ target: { name: 'backgroundColor', value: color } } as any)}
                                            style={{
                                                width: "32px", height: "32px", borderRadius: "50%",
                                                backgroundColor: color,
                                                border: formData.backgroundColor === color ? "3px solid #fff" : "1px solid #2d3748",
                                                boxShadow: formData.backgroundColor === color ? "0 0 10px rgba(255,255,255,0.4)" : "none",
                                                cursor: "pointer", transition: "all 0.2s ease"
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                            <div>
                                <label style={labelStyle}>헤더 스크롤 배경 색상</label>
                                <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "1rem" }}>스크롤 시 상단에 고정되는 네비게이션 메뉴바의 바탕색입니다. 투명 배경을 원할 경우 우측 텍스트 칸에 <code>transparent</code> 또는 <code>rgba(...)</code>를 입력하세요.</p>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <input type="color" name="headerScrollColor" value={formData.headerScrollColor?.startsWith('#') ? formData.headerScrollColor : '#0a0a0a'} onChange={handleChange} title="HEX 색상 전용 피커" style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="headerScrollColor" value={formData.headerScrollColor} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} placeholder="e.g. #0a0a0a, transparent, rgba(0,0,0,0.5)" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>하단 푸터 영역 색상 (Footer Background)</label>
                                <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginBottom: "1rem" }}>웹사이트 가장 하위 푸터 섹션의 배경색입니다. 투명 배경을 원할 경우 우측 텍스트 칸에 <code>transparent</code> 또는 <code>rgba(...)</code>를 입력하세요.</p>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <input type="color" name="footerBgColor" value={formData.footerBgColor?.startsWith('#') ? formData.footerBgColor : '#0f1115'} onChange={handleChange} title="HEX 색상 전용 피커" style={{ width: "50px", height: "50px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                    <input name="footerBgColor" value={formData.footerBgColor} onChange={handleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} placeholder="e.g. #0f1115, transparent" />
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

                </div >
            </form >
        </div >
    );
}
