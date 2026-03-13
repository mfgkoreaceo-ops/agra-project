"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./menu.module.css";
import { useSettings, MenuItem } from "../SettingsContext";
import { X } from "lucide-react";

const categories = [
    { id: "All Categories", label: "ALL MENU" },
    { id: "curry", label: "CURRY" },
    { id: "tandoori", label: "TANDOORI" },
    { id: "naan", label: "NAAN & BREAD" },
    { id: "beverage", label: "BEVERAGES" }
];

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All Categories");
    const { settings } = useSettings();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const getCategoryDisplay = (categoryId: string) => {
        const cat = categories.find(c => c.id.toLowerCase() === categoryId.toLowerCase());
        return cat ? cat.label : categoryId.toUpperCase();
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
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ""}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.label}
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
                            <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", zIndex: 10 }}>
                                {item.badges && item.badges.length > 0 && (
                                    item.badges.map(badge => (
                                        <span key={badge.id} style={{
                                            background: badge.bgColor, color: badge.textColor,
                                            padding: "0.3rem 0.6rem", fontSize: "0.75rem", fontWeight: "bold",
                                            borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                            display: "flex", alignItems: "center", gap: "0.2rem", letterSpacing: "0.05em"
                                        }}>
                                            {badge.text} {badge.chiliCount > 0 && Array(badge.chiliCount).fill('🌶️').join('')}
                                        </span>
                                    ))
                                )}
                            </div>
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
                                    <p className={styles.itemCategory} style={{ color: settings.menuItemCategoryColor, margin: 0, textTransform: "none" }}>{getCategoryDisplay(item.category)}</p>
                                </div>
                                <div style={{ flexShrink: 0, marginTop: "0.2rem", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                                    {(item.primaryBadge) ? (
                                        <span style={{
                                            background: settings.spicyTagBgColor || "transparent",
                                            color: settings.spicyTagTextColor || "var(--gold-primary)",
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: settings.spicyTagFontSize || "0.75rem",
                                            fontFamily: settings.spicyTagFont ? `'${settings.spicyTagFont}', sans-serif` : "inherit",
                                            whiteSpace: "nowrap"
                                        }}>{item.primaryBadge}</span>
                                    ) : (item.spicyLevel !== undefined) ? (
                                        item.spicyLevel > 0 && <span style={{
                                            background: settings.spicyTagBgColor || "transparent",
                                            color: settings.spicyTagTextColor || "var(--gold-primary)",
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: settings.spicyTagFontSize || "0.75rem",
                                            fontFamily: settings.spicyTagFont ? `'${settings.spicyTagFont}', sans-serif` : "inherit",
                                            whiteSpace: "nowrap"
                                        }}>{settings.spicyTagName || 'Spicy'} {Array(item.spicyLevel).fill(settings.spicyTagIcon || '🌶️').join('')}</span>
                                    ) : (item.isSpicy && <span style={{
                                        background: settings.spicyTagBgColor || "transparent",
                                        color: settings.spicyTagTextColor || "var(--gold-primary)",
                                        padding: "0.15rem 0.5rem",
                                        borderRadius: "4px",
                                        fontSize: settings.spicyTagFontSize || "0.75rem",
                                        fontFamily: settings.spicyTagFont ? `'${settings.spicyTagFont}', sans-serif` : "inherit",
                                        whiteSpace: "nowrap"
                                    }}>{settings.spicyTagName || 'Spicy'} {settings.spicyTagIcon || '🌶️'}</span>)}
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
                                    <span style={{ color: settings.menuItemCategoryColor || "var(--gold-primary)", fontSize: "0.9rem", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "none" }}>{getCategoryDisplay(selectedItem.category)}</span>
                                </div>

                                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", marginLeft: "1rem" }}>
                                    {selectedItem.badges && selectedItem.badges.length > 0 ? (
                                        selectedItem.badges.map(badge => (
                                            <span key={badge.id} style={{
                                                background: badge.bgColor, color: badge.textColor,
                                                padding: "0.2rem 0.5rem", fontSize: "0.8rem", fontWeight: "bold",
                                                borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "0.2rem",
                                                verticalAlign: "middle", letterSpacing: "0.05em", whiteSpace: "nowrap"
                                            }}>
                                                {badge.text} {badge.chiliCount > 0 && Array(badge.chiliCount).fill('🌶️').join('')}
                                            </span>
                                        ))
                                    ) : (
                                        (selectedItem.primaryBadge) ? (
                                            <span style={{
                                                background: settings.spicyTagBgColor || "transparent",
                                                color: settings.spicyTagTextColor || "var(--gold-primary)",
                                                padding: "0.2rem 0.6rem",
                                                borderRadius: "4px",
                                                fontSize: settings.spicyTagFontSize || "0.8rem",
                                                fontFamily: settings.spicyTagFont ? `'${settings.spicyTagFont}', sans-serif` : "inherit",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {selectedItem.primaryBadge}
                                            </span>
                                        ) : (selectedItem.spicyLevel !== undefined) ? (
                                            selectedItem.spicyLevel > 0 && <span style={{
                                                background: settings.spicyTagBgColor || "transparent",
                                                color: settings.spicyTagTextColor || "var(--gold-primary)",
                                                padding: "0.2rem 0.6rem",
                                                borderRadius: "4px",
                                                fontSize: settings.spicyTagFontSize || "0.8rem",
                                                fontFamily: settings.spicyTagFont ? `'${settings.spicyTagFont}', sans-serif` : "inherit",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {settings.spicyTagName || 'Spicy'} {Array(selectedItem.spicyLevel).fill(settings.spicyTagIcon || '🌶️').join('')}
                                            </span>
                                        ) : (selectedItem.isSpicy && <span style={{
                                            background: settings.spicyTagBgColor || "transparent",
                                            color: settings.spicyTagTextColor || "var(--gold-primary)",
                                            padding: "0.2rem 0.6rem",
                                            borderRadius: "4px",
                                            fontSize: settings.spicyTagFontSize || "0.8rem",
                                            fontFamily: settings.spicyTagFont ? `'${settings.spicyTagFont}', sans-serif` : "inherit",
                                            whiteSpace: "nowrap"
                                        }}>{settings.spicyTagName || 'Spicy'} {settings.spicyTagIcon || '🌶️'}</span>)
                                    )}
                                </div>
                            </div>
                            <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: settings.menuItemPriceColor || "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>₩{selectedItem.price}</span>
                        </div>

                        <hr style={{ border: "none", borderTop: "1px solid #2d3748", margin: "1.5rem 0" }} />

                        <p style={{ color: "#a0aec0", lineHeight: "1.6", fontSize: "1rem", whiteSpace: "pre-wrap" }}>
                            {selectedItem.description || "No detailed description available for this item."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
