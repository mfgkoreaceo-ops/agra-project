"use client";

import { useState } from "react";
import styles from "./location.module.css";
import { MapPin, Phone, Clock } from "lucide-react";
import Image from "next/image";
import { useSettings } from "../SettingsContext";

export default function LocationPage() {
    const [activeRegion, setActiveRegion] = useState("All");
    const { settings } = useSettings();

    const regions = ["All", ...(settings.regions || [])];

    const filteredStores = activeRegion === "All"
        ? settings.stores
        : settings.stores.filter(store => store.region === activeRegion);

    return (
        <div className={styles.locationContainer}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Find a Store</h1>
                <p className={styles.pageDesc}>Visit us at our premium locations across the country.</p>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>Regions</h2>
                    <ul className={styles.regionList}>
                        {regions.map(region => (
                            <li key={region}>
                                <button
                                    className={`${styles.regionBtn} ${activeRegion === region ? styles.active : ""}`}
                                    onClick={() => setActiveRegion(region)}
                                >
                                    {region}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.storeList} key={activeRegion}>
                    {filteredStores.map((store, idx) => (
                        <div key={store.id} className={`${styles.storeCard} animate-fade-up`} style={{ animationDelay: `${idx * 0.15}s` }}>
                            <div className={styles.storeImageContainer}>
                                <Image src={store.image} alt={store.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 350px" className={styles.storeImage} />
                            </div>
                            <div className={styles.storeInfo}>
                                <h3 className={styles.storeName}>{store.name}</h3>

                                <div className={styles.infoRow}>
                                    <MapPin size={18} className={styles.icon} />
                                    <span>{store.address}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <Phone size={18} className={styles.icon} />
                                    <span>{store.phone}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <Clock size={18} className={styles.icon} />
                                    <span>{store.hours}</span>
                                </div>

                                <div className={styles.actionButtons}>
                                    <a href={`tel:${store.phone.replace(/-/g, '')}`} className={styles.btnOutline}>Call Store</a>
                                    <a href={store.reservationUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ textAlign: "center", textDecoration: "none" }}>Reservation</a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredStores.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>No stores found in this region yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
