"use client";

import { useSettings, MenuItem } from "../../SettingsContext";
import { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X, Save, Upload, Type, ArrowUp, ArrowDown } from "lucide-react";
import * as XLSX from "xlsx";
import "../admin.css";

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

export default function MenuManagement() {
    const { settings, updateSettings } = useSettings();
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All Categories");
    const [showStyleSettings, setShowStyleSettings] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localItems, setLocalItems] = useState<MenuItem[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Sync local items with settings
    useEffect(() => {
        setLocalItems(settings.menuItems);
        setHasUnsavedChanges(false);
    }, [settings.menuItems]);

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

    const categories = ["curry", "tandoori", "naan", "beverage"];
    const displayCategories = ["All Categories", "curry", "tandoori", "naan", "beverage"];

    // Filter Logic
    const filteredItems = localItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "All Categories" || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });



    const handleEdit = (item: MenuItem) => {
        setCurrentItem({ ...item });
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("이 메뉴를 삭제하시겠습니까?")) {
            setLocalItems(prev => prev.filter(item => item.id !== id));
            setHasUnsavedChanges(true);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem) return;

        setLocalItems(prev => {
            const updatedItems = [...prev];
            const index = updatedItems.findIndex(item => item.id === currentItem.id);

            if (index >= 0) {
                updatedItems[index] = currentItem;
            } else {
                updatedItems.push(currentItem);
            }
            return updatedItems;
        });

        setHasUnsavedChanges(true);
        setIsEditing(false);
        setCurrentItem(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (currentItem) {
            if (type === 'checkbox') {
                setCurrentItem({ ...currentItem, [name]: (e.target as HTMLInputElement).checked });
            } else {
                setCurrentItem({ ...currentItem, [name]: value });
            }
        }
    };

    const handleInlineChange = (id: string, field: string, value: any) => {
        setLocalItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = () => {
        updateSettings({ menuItems: localItems });
        setHasUnsavedChanges(false);
        alert("모든 변경사항이 성공적으로 저장되었습니다.");
    };

    const handleAddBadge = () => {
        if (!currentItem) return;
        const currentBadges = currentItem.badges || [];
        if (currentBadges.length >= 3) {
            alert("뱃지는 최대 3개까지만 추가할 수 있습니다.");
            return;
        }
        setCurrentItem({
            ...currentItem,
            badges: [
                ...currentBadges,
                { id: Date.now().toString(), text: "SPICY", bgColor: "#e53e3e", textColor: "#ffffff", chiliCount: 1 }
            ]
        });
    };

    const handleUpdateBadge = (id: string, field: string, value: string | number) => {
        if (!currentItem || !currentItem.badges) return;
        setCurrentItem({
            ...currentItem,
            badges: currentItem.badges.map(b => b.id === id ? { ...b, [field]: value } : b)
        });
    };

    const handleRemoveBadge = (id: string) => {
        if (!currentItem || !currentItem.badges) return;
        setCurrentItem({
            ...currentItem,
            badges: currentItem.badges.filter(b => b.id !== id)
        });
    };

    // Inline image resizer
    const handleInlineImageUpload = (id: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 600;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL("image/webp", 0.8);
                    handleInlineChange(id, "image", dataUrl);
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleAddInline = () => {
        const newId = Date.now().toString();
        const newItem: MenuItem = {
            id: newId,
            name: "",
            category: "curry",
            price: "",
            status: "Active",
            description: "",
            isSpicy: false,
            spicyLevel: 0,
            badges: [],
            image: ""
        };
        setLocalItems([newItem, ...localItems]);
        setHasUnsavedChanges(true);
    };

    const handleMove = (e: React.MouseEvent, id: string, direction: number) => {
        e.stopPropagation();
        setLocalItems(prev => {
            const idx = prev.findIndex(item => item.id === id);
            if (idx < 0 || idx + direction < 0 || idx + direction >= prev.length) return prev;
            const newItems = [...prev];
            const temp = newItems[idx];
            newItems[idx] = newItems[idx + direction];
            newItems[idx + direction] = temp;
            return newItems;
        });
        setHasUnsavedChanges(true);
    };

    // Advanced Image Resizer to prevent localStorage QuotaExceededError
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentItem) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            // Create an image object to read dimensions
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 600; // Resize to max 600px width
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    // Export as compressed WebP (80% quality)
                    const dataUrl = canvas.toDataURL("image/webp", 0.8);
                    setCurrentItem({ ...currentItem, image: dataUrl });
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const newItems: MenuItem[] = data.map((row: any) => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: row.name || row.Name || row.이름 || "Unknown Menu",
                category: (row.category || row.Category || row.카테고리 || "curry").toLowerCase(),
                price: String(row.price || row.Price || row.가격 || "0"),
                status: row.status || row.Status || row.상태 || "Active",
                description: row.description || row.Description || row.설명 || "",
                isSpicy: row.isSpicy === true || row.isSpicy === 'true' || row.매운맛 === 'O',
                image: row.image || row.Image || row.이미지 || ""
            }));

            if (newItems.length > 0) {
                updateSettings({ menuItems: [...settings.menuItems, ...newItems] });
                alert(`${newItems.length}개의 메뉴가 성공적으로 업로드되었습니다.`);
            }
        };
        reader.readAsBinaryString(file);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateSettings({ [name]: value });
    };

    const fonts = [
        { name: "기본 글꼴", value: "var(--font-primary)" },
        { name: "Playfair Display", value: "'Playfair Display', serif" },
        { name: "Cinzel", value: "'Cinzel', serif" },
        { name: "Lato", value: "'Lato', sans-serif" },
        { name: "Montserrat", value: "'Montserrat', sans-serif" },
        { name: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
    ];

    const inputStyle = { width: "100%", padding: "0.6rem", background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff", marginBottom: "1rem" };
    const inlineInputStyle = { background: "transparent", border: "1px solid transparent", outline: "none", width: "100%", padding: "0.4rem", borderRadius: "4px", transition: "border-color 0.2s", color: "inherit" };
    const labelStyle = { display: "block", color: "var(--gold-primary)", marginBottom: "0.2rem", fontSize: "0.8rem", textTransform: "uppercase" as const };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">메뉴 관리</h1>
                    <p className="admin-subtitle">웹사이트의 메뉴를 추가, 수정 또는 삭제하세요. 100개 이상의 메뉴 등록이 지원됩니다.</p>
                </div>
                {!isEditing && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {hasUnsavedChanges && (
                            <button
                                onClick={handleSaveChanges}
                                className="btn-primary"
                                style={{
                                    background: "#e53e3e",
                                    color: "white",
                                    fontWeight: "bold",
                                    animation: "pulse 2s infinite"
                                }}
                            >
                                <Save size={18} style={{ marginRight: '0.5rem' }} /> 파일 영구 저장
                            </button>
                        )}
                        <button className="btn-outline" onClick={() => setShowStyleSettings(!showStyleSettings)} style={{ padding: "0.5rem 1rem" }}>
                            <Type size={16} style={{ marginRight: "0.5rem" }} /> 스타일 설정
                        </button>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                            ref={fileInputRef}
                        />
                        <button className="btn-outline" onClick={() => fileInputRef.current?.click()} style={{ padding: "0.5rem 1rem" }} title="엑셀로 일괄 업로드">
                            <Upload size={16} /> 엑셀 업로드
                        </button>
                        <button className="btn-primary" onClick={handleAddInline}>
                            <Plus size={18} /> 새 메뉴 추가
                        </button>
                    </div>
                )}
            </header>

            {showStyleSettings && !isEditing && (
                <div className="card" style={{ marginBottom: "2rem", border: "1px solid var(--gold-primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 className="card-title" style={{ margin: 0, color: "var(--gold-primary)" }}>메뉴 페이지 디자인 및 텍스트 설정</h3>
                        <button onClick={() => setShowStyleSettings(false)} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                        {/* 1. 상단 메뉴바 (서브페이지) */}
                        <div>
                            <h4 style={{ color: "#fff", marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem" }}>1. 상단 우측 메뉴바 (현재 페이지 적용)</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>글씨체 (Font)</label>
                                    <select name="subpageHeaderFont" value={settings.subpageHeaderFont || "Inter"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: `'${settings.subpageHeaderFont}', sans-serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>폰트 크기</label>
                                    <input name="subpageHeaderFontSize" value={settings.subpageHeaderFontSize || "0.9rem"} onChange={handleStyleChange} style={inputStyle} placeholder="e.g. 0.9rem, 14px" />
                                </div>
                                <div>
                                    <label style={labelStyle}>글씨 색상 (Color)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="subpageHeaderColor" value={settings.subpageHeaderColor?.startsWith('#') ? settings.subpageHeaderColor : '#000000'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="subpageHeaderColor" value={settings.subpageHeaderColor || "#000000"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. 메인 타이틀 */}
                        <div>
                            <h4 style={{ color: "#fff", marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem" }}>2. 메뉴 페이지 메인 큰 타이틀</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>메인 타이틀 텍스트</label>
                                    <input name="menuTitle" value={settings.menuTitle || "Our Menu"} onChange={handleStyleChange} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>글씨체 (Font)</label>
                                    <select name="menuFont" value={settings.menuFont || "Playfair Display"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: `'${settings.menuFont}', serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>폰트 크기</label>
                                    <input name="menuFontSize" value={settings.menuFontSize || "3.5rem"} onChange={handleStyleChange} style={inputStyle} placeholder="e.g. 3.5rem, 50px" />
                                </div>
                                <div>
                                    <label style={labelStyle}>글씨 색상 (Color)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuColor" value={settings.menuColor?.startsWith('#') ? settings.menuColor : '#fdfdfd'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuColor" value={settings.menuColor || "#fdfdfd"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. 서브 타이틀 */}
                        <div>
                            <h4 style={{ color: "#fff", marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem" }}>3. 서브 타이틀 (설명글)</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>설명글 텍스트</label>
                                    <input name="menuSubtitle" value={settings.menuSubtitle || ""} onChange={handleStyleChange} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>글씨체 (Font)</label>
                                    <select name="menuSubtitleFont" value={settings.menuSubtitleFont || "Inter"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: `'${settings.menuSubtitleFont}', sans-serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>폰트 크기</label>
                                    <input name="menuSubtitleFontSize" value={settings.menuSubtitleFontSize || "1.1rem"} onChange={handleStyleChange} style={inputStyle} placeholder="e.g. 1.1rem, 16px" />
                                </div>
                                <div>
                                    <label style={labelStyle}>글씨 색상 (Color)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuSubtitleColor" value={settings.menuSubtitleColor?.startsWith('#') ? settings.menuSubtitleColor : '#a0a0a0'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuSubtitleColor" value={settings.menuSubtitleColor || "#a0a0a0"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. 카테고리 탭 */}
                        <div>
                            <h4 style={{ color: "#fff", marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem" }}>4. 하단 카테고리 탭 (All Menu, Curry 등)</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>글씨체 (Font)</label>
                                    <select name="menuCategoryFont" value={settings.menuCategoryFont || "Inter"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: `'${settings.menuCategoryFont}', sans-serif` }}>
                                        {allAvailableFonts.map(font => (
                                            <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>폰트 크기</label>
                                    <input name="menuCategoryFontSize" value={settings.menuCategoryFontSize || "0.85rem"} onChange={handleStyleChange} style={inputStyle} placeholder="e.g. 0.85rem, 14px" />
                                </div>
                                <div>
                                    <label style={labelStyle}>기본 글씨 색상</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuCategoryColor" value={settings.menuCategoryColor?.startsWith('#') ? settings.menuCategoryColor : '#ffffff'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuCategoryColor" value={settings.menuCategoryColor || "#ffffff"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={labelStyle}>선택된 탭 통합 색상 (테두리, 배경, 마우스 호버 등)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuCategoryActiveBgColor" value={settings.menuCategoryActiveBgColor?.startsWith('#') ? settings.menuCategoryActiveBgColor : '#d4af37'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuCategoryActiveBgColor" value={settings.menuCategoryActiveBgColor || "#d4af37"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>선택된 탭 내부 글씨 색상</label>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input type="color" name="menuCategoryActiveTextColor" value={settings.menuCategoryActiveTextColor?.startsWith('#') ? settings.menuCategoryActiveTextColor : '#000000'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                        <input name="menuCategoryActiveTextColor" value={settings.menuCategoryActiveTextColor || "#000000"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                    </div>
                                </div>
                            </div>

                            {/* 5. 메뉴 카드 영역 */}
                            <div>
                                <h4 style={{ color: "#fff", marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem" }}>5. 개별 메뉴 카드 디자인</h4>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                    <div>
                                        <label style={labelStyle}>카드 배경 색상</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input type="color" name="menuCardBgColor" value={settings.menuCardBgColor?.startsWith('#') ? settings.menuCardBgColor : '#2d3748'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                            <input name="menuCardBgColor" value={settings.menuCardBgColor || "var(--surface-light)"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff", marginBottom: 0 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>배경 투명도 (Opacity): {settings.menuCardBgOpacity ?? 100}%</label>
                                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", height: "40px" }}>
                                            <input
                                                type="range"
                                                name="menuCardBgOpacity"
                                                min="0" max="100"
                                                value={settings.menuCardBgOpacity ?? 100}
                                                onChange={handleStyleChange}
                                                style={{ flex: 1, accentColor: "var(--gold-primary)" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                    <div>
                                        <label style={labelStyle}>메뉴명 글씨체 (Font)</label>
                                        <select name="menuItemNameFont" value={settings.menuItemNameFont || "Playfair Display"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: `'${settings.menuItemNameFont}', sans-serif` }}>
                                            {allAvailableFonts.map(font => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>메뉴명 폰트 크기</label>
                                        <input name="menuItemNameFontSize" value={settings.menuItemNameFontSize || "1.3rem"} onChange={handleStyleChange} style={inputStyle} placeholder="e.g. 1.3rem, 18px" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>메뉴명 색상</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input type="color" name="menuItemNameColor" value={settings.menuItemNameColor?.startsWith('#') ? settings.menuItemNameColor : '#ffffff'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                            <input name="menuItemNameColor" value={settings.menuItemNameColor || "#ffffff"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                    <div>
                                        <label style={labelStyle}>가격 텍스트 색상</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input type="color" name="menuItemPriceColor" value={settings.menuItemPriceColor?.startsWith('#') ? settings.menuItemPriceColor : '#d4af37'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                            <input name="menuItemPriceColor" value={settings.menuItemPriceColor || "#d4af37"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>분류(카테고리) 텍스트 색상</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input type="color" name="menuItemCategoryColor" value={settings.menuItemCategoryColor?.startsWith('#') ? settings.menuItemCategoryColor : '#888888'} onChange={handleStyleChange} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }} />
                                            <input name="menuItemCategoryColor" value={settings.menuItemCategoryColor || "#888888"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: "monospace", color: "#fff" }} />
                                        </div>
                                    </div>
                                </div>

                                {/* 6. 메뉴 뱃지 (Best, Spicy, Halal) 설정 */}
                                <div style={{ marginTop: "2rem" }}>
                                    <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem" }}>6. 메인 뱃지 (Best, Spicy, Halal 등) 텍스트 스타일 지정</h4>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                        <div>
                                            <label style={labelStyle}>뱃지 공통 폰트 (Font)</label>
                                            <select name="badgeFont" value={settings.badgeFont || "Inter"} onChange={handleStyleChange} style={{ ...inputStyle, fontFamily: `'${settings.badgeFont}', sans-serif` }}>
                                                {allAvailableFonts.map(font => (
                                                    <option key={font.value} value={font.value} style={{ fontFamily: `'${font.value}', sans-serif` }}>{font.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>폰트 크기</label>
                                            <input name="badgeFontSize" value={settings.badgeFontSize || "0.8rem"} onChange={handleStyleChange} style={inputStyle} placeholder="e.g. 0.8rem, 12px" />
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                                        <div style={{ border: "1px solid #2d3748", padding: "1rem", borderRadius: "8px" }}>
                                            <p style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Best ⭐ 뱃지 색상</p>
                                            <label style={labelStyle}>배경색</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                                <input type="color" name="badgeBestBgColor" value={settings.badgeBestBgColor?.startsWith('#') ? settings.badgeBestBgColor : '#d4af37'} onChange={handleStyleChange} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                                <input name="badgeBestBgColor" value={settings.badgeBestBgColor || "#d4af37"} onChange={handleStyleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                            </div>
                                            <label style={labelStyle}>글씨색</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input type="color" name="badgeBestTextColor" value={settings.badgeBestTextColor?.startsWith('#') ? settings.badgeBestTextColor : '#000000'} onChange={handleStyleChange} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                                <input name="badgeBestTextColor" value={settings.badgeBestTextColor || "#000000"} onChange={handleStyleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                            </div>
                                        </div>

                                        <div style={{ border: "1px solid #2d3748", padding: "1rem", borderRadius: "8px" }}>
                                            <p style={{ color: "#e53e3e", fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Spicy 🌶️ 뱃지 색상</p>
                                            <label style={labelStyle}>배경색</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                                <input type="color" name="badgeSpicyBgColor" value={settings.badgeSpicyBgColor?.startsWith('#') ? settings.badgeSpicyBgColor : '#e53e3e'} onChange={handleStyleChange} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                                <input name="badgeSpicyBgColor" value={settings.badgeSpicyBgColor || "#e53e3e"} onChange={handleStyleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                            </div>
                                            <label style={labelStyle}>글씨색</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input type="color" name="badgeSpicyTextColor" value={settings.badgeSpicyTextColor?.startsWith('#') ? settings.badgeSpicyTextColor : '#ffffff'} onChange={handleStyleChange} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                                <input name="badgeSpicyTextColor" value={settings.badgeSpicyTextColor || "#ffffff"} onChange={handleStyleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                            </div>
                                        </div>

                                        <div style={{ border: "1px solid #2d3748", padding: "1rem", borderRadius: "8px" }}>
                                            <p style={{ color: "#38a169", fontWeight: "bold", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Halal 🌿 뱃지 색상</p>
                                            <label style={labelStyle}>배경색</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                                <input type="color" name="badgeHalalBgColor" value={settings.badgeHalalBgColor?.startsWith('#') ? settings.badgeHalalBgColor : '#38a169'} onChange={handleStyleChange} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                                <input name="badgeHalalBgColor" value={settings.badgeHalalBgColor || "#38a169"} onChange={handleStyleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                            </div>
                                            <label style={labelStyle}>글씨색</label>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input type="color" name="badgeHalalTextColor" value={settings.badgeHalalTextColor?.startsWith('#') ? settings.badgeHalalTextColor : '#ffffff'} onChange={handleStyleChange} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                                <input name="badgeHalalTextColor" value={settings.badgeHalalTextColor || "#ffffff"} onChange={handleStyleChange} style={{ ...inputStyle, padding: "0.4rem", fontSize: "0.8rem", marginBottom: 0 }} />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isEditing ? (
                <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#a0aec0" }} />
                            <input
                                type="text"
                                placeholder="메뉴 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: "100%", padding: "0.8rem 1rem 0.8rem 2.8rem",
                                    background: "#0f1115", border: "1px solid #2d3748",
                                    borderRadius: "6px", color: "#fff", outline: "none"
                                }}
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{
                                padding: "0.8rem 1rem", background: "#0f1115", minWidth: "150px",
                                border: "1px solid #2d3748", borderRadius: "6px", color: "#fff", outline: "none",
                                textTransform: "capitalize"
                            }}>
                            {displayCategories.map(cat => <option key={cat} value={cat}>{cat === "All Categories" ? "전체 카테고리" : cat}</option>)}
                        </select>
                    </div>

                    {hasUnsavedChanges && (
                        <div style={{ background: "rgba(236, 201, 75, 0.1)", border: "1px solid var(--gold-primary)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "var(--gold-primary)", fontWeight: "bold" }}>⚠️ 저장되지 않은 변경사항이 있습니다.</span>
                                <span style={{ color: "#a0aec0", fontSize: "0.85rem" }}>변경사항을 웹사이트에 반영하려면 저장 버튼을 눌러주세요.</span>
                            </div>
                            <button onClick={handleSaveChanges} className="btn-primary" style={{ padding: "0.5rem 1.5rem", fontWeight: "bold" }}>
                                변경사항 일괄 저장
                            </button>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                        <button onClick={handleAddInline} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--gold-primary)", color: "#000", border: "none" }}>
                            <Plus size={18} /> 새 메뉴 추가
                        </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #2d3748", color: "#a0aec0", fontSize: "0.8rem", textTransform: "uppercase" }}>
                                    <th style={{ padding: "1rem" }}>사진</th>
                                    <th style={{ padding: "1rem" }}>메뉴명 / 매운맛</th>
                                    <th style={{ padding: "1rem" }}>카테고리</th>
                                    {/* <th style={{ padding: "1rem" }}>가격 (원)</th> */}
                                    <th style={{ padding: "1rem" }}>상태</th>
                                    <th style={{ padding: "1rem", textAlign: "right" }}>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #2d3748", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#2d3748"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "0.5rem 1rem", position: "relative" }}>
                                            <label style={{ cursor: "pointer", display: "inline-block", position: "relative" }}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #2d3748" }} />
                                                ) : (
                                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2d3748", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#a0aec0", textAlign: "center", lineHeight: "1.1" }}>사진<br />등록</div>
                                                )}
                                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleInlineImageUpload(item.id, e.target.files[0])} />
                                            </label>
                                        </td>
                                        <td style={{ padding: "0.5rem 1rem", fontWeight: "500", color: "#fff" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleInlineChange(item.id, 'name', e.target.value)}
                                                    onFocus={(e) => e.target.style.border = "1px solid #4a5568"}
                                                    onBlur={(e) => e.target.style.border = "1px solid transparent"}
                                                    style={{ ...inlineInputStyle, fontWeight: "500", minWidth: "120px", marginBottom: 0 }}
                                                    placeholder="메뉴명 입력"
                                                />
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <select
                                                        value={item.primaryBadge !== undefined ? item.primaryBadge : (item.spicyLevel ? `Spicy ${Array(item.spicyLevel).fill('🌶️').join('')}` : (item.isSpicy ? 'Spicy 🌶️' : ''))}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setLocalItems(prev => prev.map(i => i.id === item.id ? { ...i, primaryBadge: val, spicyLevel: 0, isSpicy: false } : i));
                                                            setHasUnsavedChanges(true);
                                                        }}
                                                        style={{ ...inlineInputStyle, fontSize: "0.75rem", padding: "0.2rem", width: "auto" }}
                                                    >
                                                        <option value="">표시 안함(기본)</option>
                                                        <option value="Best ⭐">Best ⭐</option>
                                                        <option value="Spicy 🌶️">Spicy 🌶️</option>
                                                        <option value="Spicy 🌶️🌶️">Spicy 🌶️🌶️</option>
                                                        <option value="Spicy 🌶️🌶️🌶️">Spicy 🌶️🌶️🌶️</option>
                                                        <option value="Halal 🌿">Halal 🌿</option>
                                                    </select>
                                                    {/* Removed redundant isSpicy display */}
                                                    {item.badges && item.badges.length > 0 && <span style={{ color: "#a0aec0", fontSize: "0.7rem", flexShrink: 0 }}>+{item.badges.length}태그</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "0.5rem 1rem", color: "#a0aec0", textTransform: "capitalize" }}>
                                            <select
                                                value={item.category}
                                                onChange={(e) => handleInlineChange(item.id, 'category', e.target.value)}
                                                onFocus={(e) => e.target.style.border = "1px solid #4a5568"}
                                                onBlur={(e) => e.target.style.border = "1px solid transparent"}
                                                style={{ ...inlineInputStyle, textTransform: "capitalize", minWidth: "120px" }}
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </td>
                                        {/* <td style={{ padding: "0.5rem 1rem", color: "#a0aec0" }}>
                                            <input
                                                type="text"
                                                value={item.price}
                                                onChange={(e) => handleInlineChange(item.id, 'price', e.target.value)}
                                                onFocus={(e) => e.target.style.border = "1px solid #4a5568"}
                                                onBlur={(e) => e.target.style.border = "1px solid transparent"}
                                                style={{ ...inlineInputStyle, width: "100px" }}
                                            />
                                        </td> */}
                                        <td style={{ padding: "0.5rem 1rem" }}>
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleInlineChange(item.id, 'status', e.target.value)}
                                                style={{
                                                    ...inlineInputStyle,
                                                    width: "110px",
                                                    padding: "0.3rem 0.5rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold",
                                                    background: item.status === 'Active' ? "rgba(72, 187, 120, 0.2)" : item.status === 'Sold Out' ? "rgba(229, 62, 62, 0.2)" : "rgba(160, 174, 192, 0.2)",
                                                    color: item.status === 'Active' ? "#48bb78" : item.status === 'Sold Out' ? "#e53e3e" : "#a0aec0",
                                                    border: "1px solid transparent"
                                                }}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Sold Out">Sold Out</option>
                                                <option value="Hidden">Hidden</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: "0.5rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                                            {searchTerm === "" && filterCategory === "All Categories" && (
                                                <>
                                                    <button onClick={(e) => handleMove(e, item.id, -1)} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", marginRight: "0.3rem" }} title="위로 되돌리기"><ArrowUp size={16} /></button>
                                                    <button onClick={(e) => handleMove(e, item.id, 1)} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", marginRight: "1rem" }} title="아래로 되돌리기"><ArrowDown size={16} /></button>
                                                </>
                                            )}
                                            <button onClick={() => handleEdit(item)} style={{ background: "none", border: "none", color: "var(--gold-primary)", cursor: "pointer", marginRight: "1rem", fontSize: "0.85rem", textDecoration: "underline" }}>상세/태그</button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer" }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#a0aec0" }}>등록된 메뉴가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#a0aec0" }}>총 메뉴 수: {filteredItems.length}</div>
                </div >
            ) : (
                <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #2d3748" }}>
                        <h3 className="card-title" style={{ margin: 0 }}>{currentItem?.name ? '메뉴 수정' : '새 메뉴 추가'}</h3>
                        <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSave}>
                        <div>
                            <label style={labelStyle}>메뉴명</label>
                            <input required name="name" value={currentItem?.name || ""} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>카테고리</label>
                                <select required name="category" value={currentItem?.category || "curry"} onChange={handleChange} style={{ ...inputStyle, textTransform: "capitalize" }}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {/* <div>
                                <label style={labelStyle}>가격 (예: 24,000)</label>
                                <input required name="price" value={currentItem?.price || ""} onChange={handleChange} style={inputStyle} />
                            </div> */}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <label style={labelStyle}>상태</label>
                                <select required name="status" value={currentItem?.status || "Active"} onChange={handleChange} style={inputStyle}>
                                    <option value="Active">Active</option>
                                    <option value="Sold Out">Sold Out</option>
                                    <option value="Hidden">Hidden</option>
                                </select>
                            </div>

                            {/* 커스텀 태그 (뱃지) 관리 영역 */}
                            <div style={{ marginTop: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px dashed #2d3748", borderRadius: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>커스텀 태그 (최대 3개)</label>
                                    <button type="button" onClick={handleAddBadge} className="btn-outline" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                                        <Plus size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> 태그 추가
                                    </button>
                                </div>
                                {(!currentItem?.badges || currentItem.badges.length === 0) && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "#a0aec0", fontSize: "0.8rem" }}>
                                            <span style={{ marginRight: "0.5rem" }}>기본 간편 뱃지</span>
                                            <select
                                                value={currentItem?.primaryBadge !== undefined ? currentItem?.primaryBadge : (currentItem?.spicyLevel ? `Spicy ${Array(currentItem.spicyLevel).fill('🌶️').join('')}` : (currentItem?.isSpicy ? 'Spicy 🌶️' : ''))}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCurrentItem({ ...currentItem!, primaryBadge: val, spicyLevel: 0, isSpicy: false });
                                                }}
                                                style={{ background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff", width: "auto", padding: "0.2rem", fontSize: "0.8rem", marginBottom: 0 }}
                                            >
                                                <option value="">표시 안함(기본)</option>
                                                <option value="Best ⭐">Best ⭐</option>
                                                <option value="Spicy 🌶️">Spicy 🌶️</option>
                                                <option value="Spicy 🌶️🌶️">Spicy 🌶️🌶️</option>
                                                <option value="Spicy 🌶️🌶️🌶️">Spicy 🌶️🌶️🌶️</option>
                                                <option value="Halal 🌿">Halal 🌿</option>
                                            </select>
                                        </label>
                                    </div>
                                )}
                                {currentItem?.badges?.map((badge, idx) => (
                                    <div key={badge.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: idx < (currentItem.badges?.length || 0) - 1 ? "0.8rem" : "0", flexWrap: "wrap", background: "#0a0c10", padding: "0.5rem", borderRadius: "6px" }}>
                                        <input type="text" value={badge.text} onChange={(e) => handleUpdateBadge(badge.id, "text", e.target.value)} style={{ ...inputStyle, flex: "1", minWidth: "80px", marginBottom: 0, padding: "0.4rem" }} placeholder="태그명 (예: HALAL)" />
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#0f1115", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                                            <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>배경</span>
                                            <input type="color" value={badge.bgColor} onChange={(e) => handleUpdateBadge(badge.id, "bgColor", e.target.value)} style={{ width: "24px", height: "24px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#0f1115", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                                            <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>글자</span>
                                            <input type="color" value={badge.textColor} onChange={(e) => handleUpdateBadge(badge.id, "textColor", e.target.value)} style={{ width: "24px", height: "24px", padding: 0, border: "none", cursor: "pointer", background: "transparent" }} />
                                        </div>
                                        <select value={badge.chiliCount} onChange={(e) => handleUpdateBadge(badge.id, "chiliCount", parseInt(e.target.value))} style={{ ...inputStyle, width: "auto", marginBottom: 0, padding: "0.4rem", fontSize: "0.85rem" }}>
                                            <option value={0}>고추 없음</option>
                                            <option value={1}>🌶️ 1개</option>
                                            <option value={2}>🌶️🌶️ 2개</option>
                                            <option value={3}>🌶️🌶️🌶️ 3개</option>
                                        </select>
                                        <button type="button" onClick={() => handleRemoveBadge(badge.id)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", padding: "0.4rem" }} title="태그 삭제">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>상세 설명</label>
                            <textarea
                                required name="description"
                                value={currentItem?.description || ""}
                                onChange={handleChange}
                                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                                placeholder="팝업에 표시될 상세 설명을 입력하세요..."
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>메뉴 사진 (자동 최적화 업로드)</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: "0.4rem" }} />
                            <p style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: "-0.5rem", marginBottom: "1rem" }}>사진은 50개 이상 업로드할 수 있도록 자동으로 크기가 조절되고 압축됩니다.</p>
                            {currentItem?.image && (
                                <img src={currentItem.image} alt="Preview" style={{ width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover", border: "2px solid #2d3748" }} />
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                                <Save size={18} style={{ marginRight: "0.5rem" }} /> 메뉴 저장
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-outline" style={{ flex: 1, justifyContent: "center" }}>
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )
            }
        </div >
    );
}
