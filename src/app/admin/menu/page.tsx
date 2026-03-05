"use client";

import { useSettings, MenuItem } from "../../SettingsContext";
import { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, Save } from "lucide-react";
import "../admin.css";

export default function MenuManagement() {
    const { settings, updateSettings } = useSettings();
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All Categories");

    const categories = ["curry", "tandoori", "naan", "beverage"];
    const displayCategories = ["All Categories", "curry", "tandoori", "naan", "beverage"];

    // Filter Logic
    const filteredItems = settings.menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "All Categories" || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAdd = () => {
        setCurrentItem({
            id: Date.now().toString(),
            name: "",
            category: "curry",
            price: "",
            status: "Active",
            description: "",
            isSpicy: false,
            image: ""
        });
        setIsEditing(true);
    };

    const handleEdit = (item: MenuItem) => {
        setCurrentItem({ ...item });
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("이 메뉴를 삭제하시겠습니까?")) {
            const updatedItems = settings.menuItems.filter(item => item.id !== id);
            updateSettings({ menuItems: updatedItems });
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem) return;

        let updatedItems = [...settings.menuItems];
        const index = updatedItems.findIndex(item => item.id === currentItem.id);

        if (index >= 0) {
            updatedItems[index] = currentItem;
        } else {
            updatedItems.push(currentItem);
        }

        updateSettings({ menuItems: updatedItems });
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

    const inputStyle = { width: "100%", padding: "0.6rem", background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff", marginBottom: "1rem" };
    const labelStyle = { display: "block", color: "var(--gold-primary)", marginBottom: "0.2rem", fontSize: "0.8rem", textTransform: "uppercase" as const };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">메뉴 관리</h1>
                    <p className="admin-subtitle">웹사이트의 메뉴를 추가, 수정 또는 삭제하세요. 100개 이상의 메뉴 등록이 지원됩니다.</p>
                </div>
                {!isEditing && (
                    <button className="btn-primary" onClick={handleAdd}>
                        <Plus size={18} /> 새 메뉴 추가
                    </button>
                )}
            </header>

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

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #2d3748", color: "#a0aec0", fontSize: "0.9rem", textTransform: "uppercase" }}>
                                    <th style={{ padding: "1rem" }}>사진</th>
                                    <th style={{ padding: "1rem" }}>메뉴명</th>
                                    <th style={{ padding: "1rem" }}>카테고리</th>
                                    <th style={{ padding: "1rem" }}>가격 (원)</th>
                                    <th style={{ padding: "1rem" }}>상태</th>
                                    <th style={{ padding: "1rem", textAlign: "right" }}>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #2d3748", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#2d3748"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "1rem" }}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #2d3748" }} />
                                            ) : (
                                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2d3748", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#a0aec0" }}>사진 없음</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem", fontWeight: "500", color: "#fff" }}>
                                            {item.name}
                                            {item.isSpicy && <span style={{ marginLeft: "0.5rem", color: "#e53e3e", fontSize: "0.8rem" }}>🌶️</span>}
                                        </td>
                                        <td style={{ padding: "1rem", color: "#a0aec0", textTransform: "capitalize" }}>{item.category}</td>
                                        <td style={{ padding: "1rem", color: "#a0aec0" }}>{item.price}</td>
                                        <td style={{ padding: "1rem" }}>
                                            <span style={{
                                                padding: "0.3rem 0.8rem", borderRadius: "12px", fontSize: "0.8rem",
                                                background: item.status === 'Active' ? "rgba(72, 187, 120, 0.2)" : item.status === 'Sold Out' ? "rgba(229, 62, 62, 0.2)" : "rgba(160, 174, 192, 0.2)",
                                                color: item.status === 'Active' ? "#48bb78" : item.status === 'Sold Out' ? "#e53e3e" : "#a0aec0"
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                                            <button onClick={() => handleEdit(item)} style={{ background: "none", border: "none", color: "var(--gold-primary)", cursor: "pointer", marginRight: "1rem" }}><Edit2 size={16} /></button>
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
                </div>
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

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>카테고리</label>
                                <select required name="category" value={currentItem?.category || "curry"} onChange={handleChange} style={{ ...inputStyle, textTransform: "capitalize" }}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>가격 (예: 24,000)</label>
                                <input required name="price" value={currentItem?.price || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <label style={labelStyle}>상태</label>
                                <select required name="status" value={currentItem?.status || "Active"} onChange={handleChange} style={inputStyle}>
                                    <option value="Active">Active</option>
                                    <option value="Sold Out">Sold Out</option>
                                    <option value="Hidden">Hidden</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", padding: "0.5rem" }}>
                                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "#fff" }}>
                                    <input type="checkbox" name="isSpicy" checked={currentItem?.isSpicy || false} onChange={handleChange} style={{ marginRight: "0.5rem", width: "18px", height: "18px" }} />
                                    매운맛 표시 🌶️
                                </label>
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
            )}
        </div>
    );
}
