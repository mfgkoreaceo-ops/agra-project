"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./menu.module.css";
import { useSettings, MenuItem } from "../SettingsContext";
import { X } from "lucide-react";

const categories = [
    { id: "All Categories", label: "All Menu" },
    { id: "curry", label: "Curry" },
    { id: "tandoori", label: "Tandoori" },
    { id: "naan", label: "Naan & Bread" },
    { id: "beverage", label: "Beverages" }
];

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All Categories");
    const { settings } = useSettings();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const activeMenuItems = settings.menuItems.filter(item => item.status !== "Hidden");

    const filteredMenu = activeCategory === "All Categories"
        ? activeMenuItems
        : activeMenuItems.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

    return (
        <div className={styles.menuContainer}>
            <div className={styles.menuHeader}>
                <h1 className={styles.pageTitle}>Our Menu</h1>
                <p className={styles.pageDesc}>Experience the rich and authentic flavors of India.</p>
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

            <div className={styles.menuGrid}>
                {filteredMenu.map(item => (
                    <div
                        key={item.id}
                        className={styles.menuCard}
                        onClick={() => setSelectedItem(item)}
                        style={{ cursor: "pointer", position: "relative" }}
                    >
                        <div className={styles.cardImageContainer} style={{ opacity: item.status === 'Sold Out' ? 0.5 : 1 }}>
                            {item.image ? (
                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className={styles.cardImage} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", background: "#2d3748", display: "flex", alignItems: "center", justifyContent: "center", color: "#a0aec0" }}>No Image Available</div>
                            )}
                            {item.isSpicy && <span className={styles.spicyTag}>Spicy 🌶️</span>}
                            {item.status === 'Sold Out' && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.8)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", fontWeight: "bold", zIndex: 2 }}>SOLD OUT</span>}
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardTop}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <span className={styles.itemPrice}>₩{item.price}</span>
                            </div>
                            <p className={styles.itemCategory} style={{ textTransform: "capitalize" }}>{item.category}</p>
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
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
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
                                    <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "0.2rem" }}>
                                        {selectedItem.name}
                                        {selectedItem.isSpicy && <span style={{ marginLeft: "0.5rem", fontSize: "1.2rem" }}>🌶️</span>}
                                    </h2>
                                    <span style={{ color: "var(--gold-primary)", textTransform: "capitalize", fontSize: "0.9rem", fontWeight: "bold" }}>{selectedItem.category}</span>
                                </div>
                                <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fff" }}>₩{selectedItem.price}</span>
                            </div>

                            <hr style={{ border: "none", borderTop: "1px solid #2d3748", margin: "1.5rem 0" }} />

                            <p style={{ color: "#a0aec0", lineHeight: "1.6", fontSize: "1rem", whiteSpace: "pre-wrap" }}>
                                {selectedItem.description || "No detailed description available for this item."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
