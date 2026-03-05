"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Store = {
    id: string; // Using string id (e.g., UUID or timestamp) for easier management later, or numbers are fine. Let's stick with string for robust dynamic lists
    region: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    image: string;
    reservationUrl: string; // Target: Naver Place Reservation URL
};

export type MenuItem = {
    id: string;
    name: string;
    category: "curry" | "tandoori" | "naan" | "beverage" | string;
    price: string;
    status: "Active" | "Sold Out" | "Hidden";
    description: string;
    isSpicy: boolean;
    image: string;
};

export type SiteSettings = {
    logoType: "text" | "image";
    logoText: string;
    logoImageUrl: string;
    philosophyTitle: string;
    philosophyDesc1: string;
    philosophyDesc2: string;
    footerTagline: string;
    contactAddress: string;
    contactPhone: string;
    primaryGoldColor: string;
    backgroundColor: string;
    heroImage: string; // Keep this for backward compatibility and admin ease
    heroImages: string[];
    signatureImage1: string;
    signatureImage2: string;
    signatureImage3: string;
    stores: Store[];
    regions: string[];
    menuItems: MenuItem[];
    headingFont: string;
    bodyFont: string;
};

const defaultSettings: SiteSettings = {
    logoType: "text",
    logoText: "AGRA",
    logoImageUrl: "",
    philosophyTitle: "Our Philosophy",
    philosophyDesc1: "AGRA is named after the historic city in Northern India, the home of the Taj Mahal. Before New Delhi became the capital, Agra was the heart of the empire, carrying the traditional charm and rich culinary heritage of India.",
    philosophyDesc2: "We bring that royal authenticity to your table. Experience a premium dining atmosphere with carefully curated spices, tandoor-baked breads, and curries simmered to perfection.",
    footerTagline: "Premium & Modern Indian Cuisine",
    contactAddress: "Seoul, Jongno-gu",
    contactPhone: "02-123-4567",
    primaryGoldColor: "#d4af37",
    backgroundColor: "#0a0a0a",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    heroImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80",
    heroImages: [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", // Original Hero
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", // Restaurant Interior
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80"  // Dining Setup
    ],
    signatureImage1: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80",
    signatureImage2: "https://images.unsplash.com/photo-1599487405270-87331ca11ddc?auto=format&fit=crop&q=80",
    signatureImage3: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80",
    regions: ["Seoul", "Gyeonggi", "Incheon", "Busan", "Jeju", "Daegu"],
    menuItems: [
        { id: "1", name: "Butter Chicken Makhani", category: "curry", price: "24,800", status: "Active", description: "Rich, creamy curry made with tender tandoori chicken simmered in tomato and butter sauce.", isSpicy: false, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80" },
        { id: "2", name: "Chicken Tikka Masala", category: "curry", price: "23,800", status: "Active", description: "Spicy and flavorful roasted chicken chunks served in a rich red curry.", isSpicy: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80" },
        { id: "3", name: "Palak Paneer", category: "curry", price: "22,800", status: "Active", description: "Healthy vegetarian curry featuring pureed spinach and soft homemade cheese.", isSpicy: false, image: "https://images.unsplash.com/photo-1606850780554-b55ea4514be5?auto=format&fit=crop&q=80" },
        { id: "4", name: "Tandoori Chicken", category: "tandoori", price: "26,800", status: "Active", description: "Classic bone-in chicken marinated in yogurt and traditional spices, roasted in a clay oven.", isSpicy: true, image: "https://images.unsplash.com/photo-1599487405270-87331ca11ddc?auto=format&fit=crop&q=80" },
        { id: "5", name: "Murgh Karahi", category: "tandoori", price: "27,800", status: "Active", description: "Tender chicken stir-fried with tomatoes, green chilies, and ginger in a traditional wok.", isSpicy: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80" },
        { id: "6", name: "Garlic Naan", category: "naan", price: "3,800", status: "Active", description: "Traditional flatbread topped with minced garlic and cilantro, baked fresh in the tandoor.", isSpicy: false, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80" },
        { id: "7", name: "Classic Naan", category: "naan", price: "3,000", status: "Active", description: "Soft and fluffy traditional Indian flatbread baked against the walls of our clay oven.", isSpicy: false, image: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?auto=format&fit=crop&q=80" },
        { id: "8", name: "Mango Lassi", category: "beverage", price: "6,000", status: "Active", description: "A refreshing traditional yogurt-based drink perfectly blended with sweet mangoes.", isSpicy: false, image: "https://images.unsplash.com/photo-1544145945-f9042538dea1?auto=format&fit=crop&q=80" },
    ],
    stores: [
        {
            id: "1",
            region: "Seoul",
            name: "Agra Centerfield (Yeoksam)",
            address: "B2, 231 Teheran-ro, Gangnam-gu, Seoul",
            phone: "02-123-4567",
            hours: "11:30 - 22:00 (Break 15:00-17:00)",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
            reservationUrl: "https://booking.naver.com/booking/6/bizes/12345"
        },
        {
            id: "2",
            region: "Seoul",
            name: "Agra Jongno Tower",
            address: "B1, 51 Jong-ro, Jongno-gu, Seoul",
            phone: "02-234-5678",
            hours: "11:30 - 22:00 (Break 15:00-17:00)",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80",
            reservationUrl: "https://booking.naver.com/booking/6/bizes/54321"
        },
        {
            id: "3",
            region: "Gyeonggi",
            name: "Agra Starfield Hanam",
            address: "3F, 750 Misa-daero, Hanam-si, Gyeonggi-do",
            phone: "031-123-4567",
            hours: "10:00 - 22:00",
            image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80",
            reservationUrl: "https://booking.naver.com/booking/6/bizes/99999"
        }
    ]
};

type SettingsContextType = {
    settings: SiteSettings;
    updateSettings: (newSettings: Partial<SiteSettings>) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("agra_site_settings");
        if (saved) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const updateSettings = (newSettings: Partial<SiteSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        try {
            localStorage.setItem("agra_site_settings", JSON.stringify(updated));
        } catch (error) {
            console.error("Storage Error:", error);
            alert("Storage Limit Exceeded! The image might be too large or you have too many items. Please use a smaller image.");
        }
        applyThemeColors(updated);
    };

    useEffect(() => {
        if (isLoaded) {
            applyThemeColors(settings);
        }
    }, [settings, isLoaded]);

    const applyThemeColors = (currentSettings: SiteSettings) => {
        if (typeof document !== "undefined") {
            document.documentElement.style.setProperty("--gold-primary", currentSettings.primaryGoldColor);
            document.documentElement.style.setProperty("--background", currentSettings.backgroundColor);

            // Dynamic Font Injection
            const headingFont = currentSettings.headingFont || "Playfair Display";
            const bodyFont = currentSettings.bodyFont || "Inter";

            // Create Google Fonts URL
            // Weight 400,600,700 for heading, 400,500,600 for body
            const formattedHeading = headingFont.replace(/ /g, "+");
            const formattedBody = bodyFont.replace(/ /g, "+");
            const fontUrl = `https://fonts.googleapis.com/css2?family=${formattedHeading}:wght@400;600;700&family=${formattedBody}:wght@400;500;600&display=swap`;

            // Check if link tag exists, if not create it
            let linkTag = document.getElementById('dynamic-google-fonts') as HTMLLinkElement;
            if (!linkTag) {
                linkTag = document.createElement('link');
                linkTag.id = 'dynamic-google-fonts';
                linkTag.rel = 'stylesheet';
                document.head.appendChild(linkTag);
            }
            if (linkTag.href !== fontUrl) {
                linkTag.href = fontUrl;
            }

            // Apply fonts to CSS variables (fallback to sans-serif/serif appropriately based on our curated list)
            const headingFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo"].includes(headingFont) ? "serif" : "sans-serif";
            const bodyFallback = "sans-serif";

            document.documentElement.style.setProperty("--font-playfair", `'${headingFont}', ${headingFallback}`);
            document.documentElement.style.setProperty("--font-inter", `'${bodyFont}', ${bodyFallback}`);
        }
    };

    if (!isLoaded) return null; // Prevent hydration mismatch

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
