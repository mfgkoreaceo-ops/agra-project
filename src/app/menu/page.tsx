"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./menu.module.css";
import { useSettings, MenuItem } from "../SettingsContext";
import { X } from "lucide-react";


export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All Categories");
    const { settings } = useSettings();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const getCategoryDisplay = (categoryId: string) => {
        if (categoryId === "All Categories") return "ALL MENU";
        if (settings.categoryDisplayNames && settings.categoryDisplayNames[categoryId.toLowerCase()]) {
            return settings.categoryDisplayNames[categoryId.toLowerCase()];
        }
        return categoryId.toUpperCase();
    };

    const activeMenuItems = settings.menuItems.filter(item => item.status !== "Hidden");

    const filteredMenu = activeCategory === "All Categories"
        ? activeMenuItems
        : activeMenuItems.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

    return (
        <div className={styles.menuContainer}>
            <div className={styles.menuHeader}>
                <h1 className={styles.pageTitle} style={{ fontFamily: "var(--font-menu)", fontSize: settings.menuFontSize || "3.5rem", color: settings.menuColor || "#fdfdfd" }}>
                    {settings.menuTitle || "Our Menu"}
                </h1>
                <p className={styles.pageDesc} style={{ fontFamily: "var(--font-menu-subtitle)", fontSize: "var(--menu-subtitle-size)", color: "var(--menu-subtitle-color)" }}>
                    {settings.menuSubtitle || "Experience the rich and authentic flavors of India."}
                </p>
            </div>

            <div className={styles.filterContainer}>
                {[{ id: "All Categories" }, ...(settings.menuCategories || ["curry", "tandoori", "naan", "beverage", "dessert", "special", "set"]).map(c => ({ id: c }))].map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ""}`}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{ fontFamily: `'${settings.menuCategoryFont || "Inter"}', sans-serif`, fontSize: settings.menuCategoryFontSize || "0.85rem" }}
                    >
                        {getCategoryDisplay(cat.id)}
                    </button>
                ))}
            </div>

            <div className={styles.menuGrid} key={activeCategory}>
                {filteredMenu.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`${styles.menuCard} animate-fade-up`}
                        onClick={() => setSelectedItem(item)}
                        style={{
                            cursor: "pointer",
                            position: "relative",
                            animationDelay: `${idx * 0.1}s`,
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}
                    >
                        <div className={styles.cardImageContainer} style={{ opacity: item.status === 'Sold Out' ? 0.5 : 1, borderRadius: "8px", overflow: "hidden" }}>
                            {item.image ? (
                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className={styles.cardImage} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", background: "#2d3748", display: "flex", alignItems: "center", justifyContent: "center", color: "#a0aec0" }}>No Image Available</div>
                            )}

                            {item.status === 'Sold Out' && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.8)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", fontWeight: "bold", zIndex: 2 }}>SOLD OUT</span>}
                        </div>
                        <div className={styles.cardContent} style={{
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: settings.menuCardBgColor ?
                                `rgba(${parseInt(settings.menuCardBgColor.slice(1, 3), 16)}, ${parseInt(settings.menuCardBgColor.slice(3, 5), 16)}, ${parseInt(settings.menuCardBgColor.slice(5, 7), 16)}, ${settings.menuCardBgOpacity !== undefined ? settings.menuCardBgOpacity / 100 : 0.8})`
                                : 'var(--menu-card-bg)'
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <h3 className={styles.itemName} style={{ fontFamily: `'${settings.menuItemNameFont}', serif`, color: settings.menuItemNameColor, fontSize: settings.menuItemNameFontSize, marginBottom: "0.5rem" }}>
                                        {item.name}
                                    </h3>
                                    <p className={styles.itemCategory} style={{ color: settings.menuItemCategoryColor, fontFamily: `'${settings.menuItemCategoryFont || "Inter"}', sans-serif`, fontSize: settings.menuItemCategoryFontSize || "0.80rem", margin: 0, textTransform: "none" }}>{getCategoryDisplay(item.category)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredMenu.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 0", color: "#a0aec0" }}>
                        <p>No menu items found in this category.</p>
                    </div>
                )}
            </div>

            {/* Modal Popup */}
            {selectedItem && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
                    padding: "1rem"
                }} onClick={() => setSelectedItem(null)}>
                    <div
                        style={{
                            background: "#0f1115", borderRadius: "12px", border: "1px solid #2d3748",
                            width: "100%", maxWidth: "500px", overflow: "hidden", position: "relative",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", padding: "0.5rem", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ width: "100%", height: "250px", position: "relative" }}>
                            {selectedItem.image ? (
                                <Image src={selectedItem.image} alt={selectedItem.name} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", background: "#2d3748", display: "flex", alignItems: "center", justifyContent: "center", color: "#a0aec0" }}>No Image</div>
                            )}
                        </div>

                        <div style={{ padding: "2rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                <div>
                                    <h2 style={{ fontSize: settings.menuItemNameFontSize || "1.5rem", color: settings.menuItemNameColor || "#fff", fontFamily: `'${settings.menuItemNameFont}', serif`, marginBottom: "0.5rem" }}>
                                        {selectedItem.name}
                                    </h2>
                                    <span style={{ color: settings.menuItemCategoryColor || "var(--gold-primary)", fontFamily: `'${settings.menuItemCategoryFont || "Inter"}', sans-serif`, fontSize: settings.menuItemCategoryFontSize || "0.80rem", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "none" }}>{getCategoryDisplay(selectedItem.category)}</span>
                                </div>
                            </div>
                            <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: settings.menuItemPriceColor || "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>₩{selectedItem.price}</span>
                        </div>

                        <div style={{ padding: "0 2rem 2rem 2rem" }}>
                            <hr style={{ border: "none", borderTop: "1px solid #2d3748", margin: "0 0 1.5rem 0" }} />
                            
                            <p style={{ 
                                color: settings.menuModalDescColor || "#a0aec0", 
                                fontFamily: `'${settings.menuModalDescFont || "Inter"}', sans-serif`, 
                                fontSize: settings.menuModalDescFontSize || "1rem", 
                                lineHeight: "1.6", 
                                whiteSpace: "pre-wrap" 
                            }}>
                                {selectedItem.description || "No detailed description available for this item."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
