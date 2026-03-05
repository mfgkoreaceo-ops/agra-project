"use client";

import { useSettings, Store } from "../../SettingsContext";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, Settings2 } from "lucide-react";
import "../admin.css";

export default function StoreUpdates() {
    const { settings, updateSettings } = useSettings();
    const [isEditingStore, setIsEditingStore] = useState(false);
    const [isManagingRegions, setIsManagingRegions] = useState(false);
    const [currentStore, setCurrentStore] = useState<Store | null>(null);
    const [newRegion, setNewRegion] = useState("");

    const regions = settings.regions || ["Seoul", "Gyeonggi", "Incheon", "Busan", "Jeju", "Daegu"];

    // --- Store Management ---
    const handleAddStore = () => {
        // Fallback to "Seoul" if no regions exist
        const initialRegion = settings.regions && settings.regions.length > 0 ? settings.regions[0] : "Seoul";

        setCurrentStore({
            id: Date.now().toString(),
            region: initialRegion,
            name: "",
            address: "",
            phone: "",
            hours: "",
            image: "",
            reservationUrl: ""
        });
        setIsEditingStore(true);
        setIsManagingRegions(false);
    };

    const handleEditStore = (store: Store) => {
        setCurrentStore({ ...store });
        setIsEditingStore(true);
        setIsManagingRegions(false);
    };

    const handleDeleteStore = (id: string) => {
        if (confirm("이 지점을 삭제하시겠습니까?")) {
            const updatedStores = settings.stores.filter(s => s.id !== id);
            updateSettings({ stores: updatedStores });
        }
    };

    const handleSaveStore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStore) return;

        let updatedStores = [...settings.stores];
        const index = updatedStores.findIndex(s => s.id === currentStore.id);

        if (index >= 0) {
            updatedStores[index] = currentStore;
        } else {
            updatedStores.push(currentStore);
        }

        updateSettings({ stores: updatedStores });
        setIsEditingStore(false);
        setCurrentStore(null);
    };

    const handleChangeStore = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (currentStore) {
            setCurrentStore({ ...currentStore, [name]: value });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentStore) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800; // slightly larger for store images
                    let scaleSize = 1;
                    if (img.width > MAX_WIDTH) {
                        scaleSize = MAX_WIDTH / img.width;
                    }
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL("image/webp", 0.8);
                        setCurrentStore({ ...currentStore, image: dataUrl });
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Region Management ---
    const handleAddRegion = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newRegion.trim();
        if (trimmed && !regions.includes(trimmed)) {
            updateSettings({ regions: [...regions, trimmed] });
            setNewRegion("");
        }
    };

    const handleDeleteRegion = (regionToRemove: string) => {
        if (confirm(`"${regionToRemove}" 지역을 삭제하시겠습니까? 이 지역에 할당된 매장은 유지되지만 재할당이 필요할 수 있습니다.`)) {
            const updatedRegions = regions.filter(r => r !== regionToRemove);
            updateSettings({ regions: updatedRegions });
        }
    };


    const inputStyle = { width: "100%", padding: "0.6rem", background: "#0f1115", border: "1px solid #2d3748", borderRadius: "4px", color: "#fff", marginBottom: "1rem" };
    const labelStyle = { display: "block", color: "var(--gold-primary)", marginBottom: "0.2rem", fontSize: "0.8rem" };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">지점 및 예약 설정</h1>
                    <p className="admin-subtitle">지점 위치, 영업시간, 네이버 플레이스 예약 링크를 관리하세요.</p>
                </div>
                {!isEditingStore && !isManagingRegions && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" className="btn-outline" onClick={() => { setIsManagingRegions(true); setIsEditingStore(false); }}>
                            <Settings2 size={18} style={{ marginRight: "0.5rem" }} /> 지역 관리
                        </button>
                        <button type="button" className="btn-primary" onClick={handleAddStore}>
                            <Plus size={18} /> 새 지점 추가
                        </button>
                    </div>
                )}
            </header>

            {isManagingRegions ? (
                // Region Manager View
                <div className="card" style={{ maxWidth: "500px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #2d3748" }}>
                        <h3 className="card-title" style={{ margin: 0 }}>지역(카테고리) 관리</h3>
                        <button onClick={() => setIsManagingRegions(false)} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleAddRegion} style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                        <input
                            value={newRegion}
                            onChange={(e) => setNewRegion(e.target.value)}
                            placeholder="예: 강원, 전라..."
                            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" disabled={!newRegion.trim()}>
                            추가
                        </button>
                    </form>

                    <div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {regions.map((r, i) => (
                                <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.8rem", background: "#0f1115", borderRadius: "4px", border: "1px solid #2d3748" }}>
                                    <span style={{ fontWeight: 500 }}>{r}</span>
                                    <button onClick={() => handleDeleteRegion(r)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer" }}><Trash2 size={16} /></button>
                                </li>
                            ))}
                            {regions.length === 0 && <li style={{ color: "#a0aec0", textAlign: "center", padding: "1rem" }}>등록된 지역이 없습니다.</li>}
                        </ul>
                    </div>

                    <button onClick={() => setIsManagingRegions(false)} className="btn-outline" style={{ marginTop: "2rem", width: "100%" }}>완료</button>
                </div>

            ) : !isEditingStore ? (
                // Store List View
                <div className="card">
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #2d3748", color: "#a0aec0", fontSize: "0.9rem", textTransform: "uppercase" }}>
                                    <th style={{ padding: "1rem" }}>지점명</th>
                                    <th style={{ padding: "1rem" }}>지역</th>
                                    <th style={{ padding: "1rem" }}>전화번호</th>
                                    <th style={{ padding: "1rem" }}>예약 링크</th>
                                    <th style={{ padding: "1rem", textAlign: "right" }}>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.stores.map((store: Store) => (
                                    <tr key={store.id} style={{ borderBottom: "1px solid #2d3748", transition: "background 0.2s" }}>
                                        <td style={{ padding: "1rem", fontWeight: "500", color: "#fff" }}>{store.name}</td>
                                        <td style={{ padding: "1rem", color: "#a0aec0" }}>{store.region}</td>
                                        <td style={{ padding: "1rem", color: "#a0aec0" }}>{store.phone}</td>
                                        <td style={{ padding: "1rem", color: "#a0aec0", fontSize: "0.85rem", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store.reservationUrl || "미설정"}</td>
                                        <td style={{ padding: "1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                                            <button onClick={() => handleEditStore(store)} style={{ background: "none", border: "none", color: "var(--gold-primary)", cursor: "pointer", marginRight: "1rem" }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteStore(store.id)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer" }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {settings.stores.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#a0aec0" }}>등록된 지점이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Store Editor View
                <div className="card" style={{ maxWidth: "600px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #2d3748" }}>
                        <h3 className="card-title" style={{ margin: 0 }}>{currentStore?.name ? '지점 수정' : '새 지점 추가'}</h3>
                        <button onClick={() => setIsEditingStore(false)} style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSaveStore}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>지점명</label>
                                <input required name="name" value={currentStore?.name || ""} onChange={handleChangeStore} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>지역</label>
                                <select required name="region" value={currentStore?.region || (regions[0] || "")} onChange={handleChangeStore} style={inputStyle}>
                                    {regions.map((r, i) => (
                                        <option key={i} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>상세 주소</label>
                            <input required name="address" value={currentStore?.address || ""} onChange={handleChangeStore} style={inputStyle} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>전화번호</label>
                                <input required name="phone" value={currentStore?.phone || ""} onChange={handleChangeStore} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>영업시간</label>
                                <input required name="hours" value={currentStore?.hours || ""} onChange={handleChangeStore} style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>네이버 플레이스 예약 URL</label>
                            <input type="url" required name="reservationUrl" placeholder="https://booking.naver.com/..." value={currentStore?.reservationUrl || ""} onChange={handleChangeStore} style={inputStyle} />
                            <p style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: "-0.5rem", marginBottom: "1rem" }}>이 지점의 정확한 네이버 예약 페이지 URL을 입력하세요.</p>
                        </div>

                        <div>
                            <label style={labelStyle}>지점 사진 (업로드)</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: "0.4rem" }} />
                            {currentStore?.image && (
                                <img src={currentStore.image} alt="Preview" style={{ maxHeight: "80px", borderRadius: "4px", marginTop: "-0.5rem", marginBottom: "1rem", objectFit: "cover" }} />
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                                <Save size={18} style={{ marginRight: "0.5rem" }} /> 지점 정보 저장
                            </button>
                            <button type="button" onClick={() => setIsEditingStore(false)} className="btn-outline" style={{ flex: 1, justifyContent: "center" }}>
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
