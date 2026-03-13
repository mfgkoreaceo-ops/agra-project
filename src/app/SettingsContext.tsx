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

export type MenuBadge = {
    id: string; // for React key binding
    text: string;
    bgColor: string;
    textColor: string;
    chiliCount: number; // 0, 1, 2, 3
};

export type MenuItem = {
    id: string;
    name: string;
    category: "curry" | "tandoori" | "naan" | "beverage" | string;
    price: string;
    status: "Active" | "Sold Out" | "Hidden";
    description: string;
    isSpicy: boolean;
    spicyLevel?: number; // 0~3
    primaryBadge?: string; // e.g. "Best ⭐", "Spicy 🌶️", "Halal 🌿"
    badges?: MenuBadge[];
    image: string;
    customFontFamily?: string;
    customFontColor?: string;
    customFontSize?: string;
};

export type SiteSettings = {
    logoType: "text" | "image";
    logoText: string;
    logoImageUrl: string;
    footerLogoImageUrl: string;
    philosophyTitle: string;
    philosophyDesc1: string;
    philosophyDesc2: string;
    philosophyImage: string;
    philosophyTitleFont: string;
    philosophyTitleFontSize: string;
    philosophyTitleColor: string;
    philosophyDescFont: string;
    philosophyDescFontSize: string;
    philosophyDescColor: string;
    philosophyTextAlign: "left" | "center" | "right";
    signatureTitle: string;
    signatureFont: string;
    signatureFontSize: string;
    signatureColor: string;
    signatureNameColor: string;
    signatureDescColor: string;
    signatureBgColor: string;
    menuTitle: string;
    menuSubtitle: string;
    menuFont: string;
    menuFontSize: string;
    menuColor: string;
    headerFont: string;
    headerFontSize: string;
    headerColor: string;
    subpageHeaderFont: string;
    subpageHeaderFontSize: string;
    subpageHeaderColor: string;
    menuSubtitleFont: string;
    menuSubtitleFontSize: string;
    menuSubtitleColor: string;
    menuCategoryFont: string;
    menuCategoryFontSize: string;
    menuCategoryColor: string;
    menuCategoryActiveBgColor: string;
    menuCategoryActiveTextColor: string;
    menuCardBgColor: string;
    menuCardBgOpacity: number;
    menuItemNameFont: string;
    menuItemNameFontSize: string;
    menuItemNameColor: string;
    menuItemPriceColor: string;
    menuItemCategoryColor: string;
    spicyTagName?: string;
    spicyTagBgColor?: string;
    spicyTagTextColor?: string;
    spicyTagIcon?: string;
    spicyTagFont?: string;
    spicyTagFontSize?: string;
    badgeFont: string;
    badgeFontSize: string;
    badgeBestBgColor: string;
    badgeBestTextColor: string;
    badgeSpicyBgColor: string;
    badgeSpicyTextColor: string;
    badgeHalalBgColor: string;
    badgeHalalTextColor: string;
    footerFont: string;
    footerFontSize: string;
    footerColor: string;
    footerTagline: string;
    footerTaglineFont: string;
    footerTaglineFontSize: string;
    footerTaglineColor: string;
    footerCompanyTitle: string;
    footerContactTitle: string;
    footerTitleFont: string;
    footerTitleFontSize: string;
    footerTitleColor: string;
    contactAddress: string;
    contactPhone: string;
    primaryGoldColor: string;
    backgroundColor: string;
    headerScrollColor: string;
    footerBgColor: string;
    heroTitle: string;
    heroTitleFont: string;
    heroTitleFontSize: string;
    heroTitleColor: string;
    heroSubtitle: string;
    heroSubtitleFont: string;
    heroSubtitleFontSize: string;
    heroSubtitleColor: string;
    heroDesc: string;
    heroDescFont: string;
    heroDescFontSize: string;
    heroDescColor: string;
    heroBtnFont: string;
    heroBtnColor: string;
    heroImage: string; // Keep this for backward compatibility and admin ease
    heroImages: string[];
    signatureImage1: string;
    signatureName1: string;
    signatureDesc1: string;
    signatureImage2: string;
    signatureName2: string;
    signatureDesc2: string;
    signatureImage3: string;
    signatureName3: string;
    signatureDesc3: string;
    stores: Store[];
    regions: string[];
    menuItems: MenuItem[];
    headingFont: string;
    bodyFont: string;
    isPromotionActive: boolean;
    promotionImage: string;
    promotionLink: string;
};

const defaultSettings: SiteSettings = {
    logoType: "text",
    logoText: "AGRA",
    logoImageUrl: "",
    footerLogoImageUrl: "",
    philosophyTitle: "Our Philosophy",
    philosophyDesc1: "AGRA is named after the historic city in Northern India, the home of the Taj Mahal. Before New Delhi became the capital, Agra was the heart of the empire, carrying the traditional charm and rich culinary heritage of India.",
    philosophyDesc2: "We bring that royal authenticity to your table. Experience a premium dining atmosphere with carefully curated spices, tandoor-baked breads, and curries simmered to perfection.",
    philosophyImage: "https://images.unsplash.com/photo-1549429457-37c225026210?auto=format&fit=crop&q=80",
    philosophyTitleFont: "Playfair Display",
    philosophyTitleFontSize: "2.5rem",
    philosophyTitleColor: "#fdfdfd",
    philosophyDescFont: "Inter",
    philosophyDescFontSize: "1.1rem",
    philosophyDescColor: "#fdfdfd",
    philosophyTextAlign: "left",
    signatureTitle: "Signature Dishes",
    signatureFont: "Playfair Display",
    signatureFontSize: "2.5rem",
    signatureColor: "#fdfdfd",
    signatureNameColor: "#fdfdfd",
    signatureDescColor: "#fdfdfd",
    signatureBgColor: "var(--surface-dark)",
    menuTitle: "Our Menu",
    menuSubtitle: "Experience the rich and authentic flavors of India.",
    menuFont: "Playfair Display",
    menuFontSize: "3.5rem",
    menuColor: "#fdfdfd",
    headerFont: "Inter",
    headerFontSize: "0.9rem",
    headerColor: "#ffffff",
    subpageHeaderFont: "Inter",
    subpageHeaderFontSize: "0.9rem",
    subpageHeaderColor: "#000000",
    menuSubtitleFont: "Inter",
    menuSubtitleFontSize: "1.1rem",
    menuSubtitleColor: "#a0a0a0",
    menuCategoryFont: "Inter",
    menuCategoryFontSize: "0.85rem",
    menuCategoryColor: "#ffffff",
    menuCategoryActiveBgColor: "#d4af37",
    menuCategoryActiveTextColor: "#000000",
    menuCardBgColor: "var(--surface-light)",
    menuCardBgOpacity: 100,
    menuItemNameFont: "Playfair Display",
    menuItemNameFontSize: "1.3rem",
    menuItemNameColor: "#ffffff",
    menuItemPriceColor: "#d4af37",
    menuItemCategoryColor: "#888888",
    spicyTagName: "Spicy",
    spicyTagBgColor: "#e53e3e",
    spicyTagTextColor: "#d4af37", // Default to gold lines/text
    spicyTagIcon: "🌶️",
    spicyTagFont: "Inter",
    spicyTagFontSize: "0.75rem",
    badgeFont: "Inter",
    badgeFontSize: "0.8rem",
    badgeBestBgColor: "#d4af37",
    badgeBestTextColor: "#000000",
    badgeSpicyBgColor: "#e53e3e",
    badgeSpicyTextColor: "#ffffff",
    badgeHalalBgColor: "#38a169",
    badgeHalalTextColor: "#ffffff",
    footerFont: "Inter",
    footerFontSize: "0.9rem",
    footerColor: "#888888",
    footerTagline: "Premium & Modern Indian Cuisine",
    footerTaglineFont: "Inter",
    footerTaglineFontSize: "0.9rem",
    footerTaglineColor: "#888888",
    footerCompanyTitle: "Company",
    footerContactTitle: "Contact",
    footerTitleFont: "Playfair Display",
    footerTitleFontSize: "1rem",
    footerTitleColor: "#ffffff",
    contactAddress: "Seoul, Jongno-gu",
    contactPhone: "02-123-4567",
    primaryGoldColor: "#d4af37",
    backgroundColor: "#0a0a0a",
    headerScrollColor: "rgba(10, 10, 10, 0.85)",
    footerBgColor: "#0f1115",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    isPromotionActive: false,
    promotionImage: "",
    promotionLink: "",
    heroTitle: "The Authentic Taste of India",
    heroTitleFont: "Playfair Display",
    heroTitleFontSize: "5.2rem",
    heroTitleColor: "#ffffff",
    heroSubtitle: "WELCOME TO",
    heroSubtitleFont: "Inter",
    heroSubtitleFontSize: "0.9rem",
    heroSubtitleColor: "#d4af37",
    heroDesc: "Experience the royal flavors and rich heritage of premium Indian dining.",
    heroDescFont: "Inter",
    heroDescFontSize: "1.1rem",
    heroDescColor: "#e2e8f0",
    heroBtnFont: "Inter",
    heroBtnColor: "#d4af37",
    heroImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80",
    heroImages: [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80", // Original Hero
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80", // Restaurant Interior
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80"  // Dining Setup
    ],
    signatureImage1: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80",
    signatureName1: "Butter Chicken",
    signatureDesc1: "Rich Tomato Curry",
    signatureImage2: "https://images.unsplash.com/photo-1599487405270-87331ca11ddc?auto=format&fit=crop&q=80",
    signatureName2: "Tandoori Chicken",
    signatureDesc2: "Clay Oven Roasted",
    signatureImage3: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80",
    signatureName3: "Garlic Naan",
    signatureDesc3: "Fresh Baked Bread",
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
        const fetchSettings = async () => {
            try {
                // 1. Data Migration: Check if there's old data in localStorage
                const localSaved = localStorage.getItem("agra_site_settings");
                if (localSaved) {
                    try {
                        const parsedLocal = JSON.parse(localSaved);
                        // Migrate it to the backend immediately
                        await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(parsedLocal),
                        });
                        // Clear the local storage so we don't migrate again
                        localStorage.removeItem("agra_site_settings");
                        console.log("Successfully migrated old localStorage data to backend.");
                    } catch (e) {
                        console.error("Failed to migrate old settings", e);
                    }
                }

                // 2. Fetch the latest settings from the backend
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const saved = await response.json();
                    if (Object.keys(saved).length > 0) {
                        setSettings({ ...defaultSettings, ...saved });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings from API:", error);
            } finally {
                setIsLoaded(true);
            }
        };
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<SiteSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        applyThemeColors(updated);

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            if (!response.ok) throw new Error("API response not ok");
        } catch (error) {
            console.error("API Storage Error:", error);
            alert("Failed to save settings permanently. The payload might be too large.");
        }
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
            document.documentElement.style.setProperty("--header-scroll-bg", currentSettings.headerScrollColor || "rgba(10, 10, 10, 0.85)");
            document.documentElement.style.setProperty("--footer-bg", currentSettings.footerBgColor || "var(--surface-dark)");
            document.documentElement.style.setProperty("--signature-bg", currentSettings.signatureBgColor || "var(--surface-dark)");

            // Dynamic Font Injection
            const headingFont = currentSettings.headingFont || "Playfair Display";
            const bodyFont = currentSettings.bodyFont || "Inter";
            const philosophyTitleFont = currentSettings.philosophyTitleFont || "Playfair Display";
            const philosophyDescFont = currentSettings.philosophyDescFont || "Inter";
            const signatureFont = currentSettings.signatureFont || "Playfair Display";
            const menuFont = currentSettings.menuFont || "Playfair Display";
            const headerFont = currentSettings.headerFont || "Inter";
            const footerFont = currentSettings.footerFont || "Inter";
            const heroTitleFont = currentSettings.heroTitleFont || "Playfair Display";
            const heroSubtitleFont = currentSettings.heroSubtitleFont || "Inter";
            const heroDescFont = currentSettings.heroDescFont || "Inter";
            const subpageHeaderFont = currentSettings.subpageHeaderFont || currentSettings.headerFont || "Inter";
            const menuSubtitleFont = currentSettings.menuSubtitleFont || "Inter";
            const menuCategoryFont = currentSettings.menuCategoryFont || "Inter";

            // Create Google Fonts URL
            const formattedHeading = headingFont.replace(/ /g, "+");
            const formattedBody = bodyFont.replace(/ /g, "+");
            const formattedPhilosophyTitle = philosophyTitleFont.replace(/ /g, "+");
            const formattedPhilosophyDesc = philosophyDescFont.replace(/ /g, "+");
            const formattedSignature = signatureFont.replace(/ /g, "+");
            const formattedMenu = menuFont.replace(/ /g, "+");
            const formattedHeader = headerFont.replace(/ /g, "+");
            const formattedFooter = footerFont.replace(/ /g, "+");
            const formattedHeroTitle = heroTitleFont.replace(/ /g, "+");
            const formattedHeroSubtitle = heroSubtitleFont.replace(/ /g, "+");
            const formattedHeroDesc = heroDescFont.replace(/ /g, "+");
            const formattedSubpageHeader = subpageHeaderFont.replace(/ /g, "+");
            const formattedMenuSubtitle = menuSubtitleFont.replace(/ /g, "+");
            const formattedMenuCategory = menuCategoryFont.replace(/ /g, "+");

            const menuItemNameFont = currentSettings.menuItemNameFont || "Playfair Display";
            const formattedMenuItemName = menuItemNameFont.replace(/ /g, "+");

            const fontFamilies = Array.from(new Set([
                formattedHeading, formattedBody, formattedPhilosophyTitle, formattedPhilosophyDesc,
                formattedSignature, formattedMenu, formattedHeader, formattedFooter,
                formattedHeroTitle, formattedHeroSubtitle, formattedHeroDesc,
                formattedSubpageHeader, formattedMenuSubtitle, formattedMenuCategory,
                formattedMenuItemName
            ]))
                .map(f => `family=${f}:wght@400;500;600;700`)
                .join('&');

            const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;

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
            const headingFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(headingFont) ? "serif" : "sans-serif";
            const bodyFallback = "sans-serif";
            const philosophyTitleFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(philosophyTitleFont) ? "serif" : "sans-serif";
            const philosophyDescFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(philosophyDescFont) ? "serif" : "sans-serif";
            const signatureFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(signatureFont) ? "serif" : "sans-serif";
            const menuFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(menuFont) ? "serif" : "sans-serif";
            const headerFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(headerFont) ? "serif" : "sans-serif";
            const footerFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(footerFont) ? "serif" : "sans-serif";
            const heroTitleFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(heroTitleFont) ? "serif" : "sans-serif";
            const heroSubtitleFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(heroSubtitleFont) ? "serif" : "sans-serif";
            const heroDescFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(heroDescFont) ? "serif" : "sans-serif";

            document.documentElement.style.setProperty("--font-playfair", `'${headingFont}', ${headingFallback}`);
            document.documentElement.style.setProperty("--font-inter", `'${bodyFont}', ${bodyFallback}`);
            document.documentElement.style.setProperty("--font-philosophy-title", `'${philosophyTitleFont}', ${philosophyTitleFallback}`);
            document.documentElement.style.setProperty("--philosophy-title-size", currentSettings.philosophyTitleFontSize || "2.5rem");
            document.documentElement.style.setProperty("--philosophy-title-color", currentSettings.philosophyTitleColor || "#fdfdfd");

            document.documentElement.style.setProperty("--font-philosophy-desc", `'${philosophyDescFont}', ${philosophyDescFallback}`);
            document.documentElement.style.setProperty("--philosophy-desc-size", currentSettings.philosophyDescFontSize || "1.1rem");
            document.documentElement.style.setProperty("--philosophy-desc-color", currentSettings.philosophyDescColor || "#fdfdfd");
            document.documentElement.style.setProperty("--font-signature", `'${signatureFont}', ${signatureFallback}`);
            document.documentElement.style.setProperty("--font-menu", `'${menuFont}', ${menuFallback}`);
            document.documentElement.style.setProperty("--font-header", `'${headerFont}', ${headerFallback}`);
            document.documentElement.style.setProperty("--header-font-size", currentSettings.headerFontSize || "0.9rem");
            document.documentElement.style.setProperty("--header-color", currentSettings.headerColor || "#ffffff");

            // Subpage specific header configuration
            const subpageHeaderFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(subpageHeaderFont) ? "serif" : "sans-serif";
            document.documentElement.style.setProperty("--font-subpage-header", `'${subpageHeaderFont}', ${subpageHeaderFallback}`);
            document.documentElement.style.setProperty("--subpage-header-size", currentSettings.subpageHeaderFontSize || "0.9rem");
            document.documentElement.style.setProperty("--subpage-header-color", currentSettings.subpageHeaderColor || currentSettings.headerColor || "#000000");

            // Menu subtitle configuration
            const menuSubtitleFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(menuSubtitleFont) ? "serif" : "sans-serif";
            document.documentElement.style.setProperty("--font-menu-subtitle", `'${menuSubtitleFont}', ${menuSubtitleFallback}`);
            document.documentElement.style.setProperty("--menu-subtitle-size", currentSettings.menuSubtitleFontSize || "1.1rem");
            document.documentElement.style.setProperty("--menu-subtitle-color", currentSettings.menuSubtitleColor || "#a0a0a0");

            // Menu category tabs configuration
            const menuCategoryFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(menuCategoryFont) ? "serif" : "sans-serif";
            document.documentElement.style.setProperty("--font-menu-category", `'${menuCategoryFont}', ${menuCategoryFallback}`);
            document.documentElement.style.setProperty("--menu-category-size", currentSettings.menuCategoryFontSize || "0.85rem");
            document.documentElement.style.setProperty("--menu-category-color", currentSettings.menuCategoryColor || "#ffffff");
            document.documentElement.style.setProperty("--menu-category-active-bg", currentSettings.menuCategoryActiveBgColor || "var(--gold-primary)");
            document.documentElement.style.setProperty("--menu-category-active-text", currentSettings.menuCategoryActiveTextColor || "#000000");

            // Menu card configuration
            const opacityVal = currentSettings.menuCardBgOpacity;
            const opacity = (opacityVal !== undefined && opacityVal !== null) ? Number(opacityVal) : 100;
            const bgColor = currentSettings.menuCardBgColor || "var(--surface-light)";
            let finalBgColor = bgColor;
            if (bgColor.startsWith('#') && (bgColor.length === 7 || bgColor.length === 4)) {
                const alphaHex = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
                finalBgColor = `${bgColor}${alphaHex}`;
            }
            document.documentElement.style.setProperty("--menu-card-bg", finalBgColor);

            const menuItemNameFallback = ["Playfair Display", "Noto Serif KR", "Nanum Myeongjo", "Lora", "Merriweather"].includes(menuItemNameFont) ? "serif" : "sans-serif";
            document.documentElement.style.setProperty("--font-menu-item-name", `'${menuItemNameFont}', ${menuItemNameFallback}`);
            document.documentElement.style.setProperty("--menu-item-name-size", currentSettings.menuItemNameFontSize || "1.3rem");
            document.documentElement.style.setProperty("--menu-item-name-color", currentSettings.menuItemNameColor || "#ffffff");
            document.documentElement.style.setProperty("--menu-item-price-color", currentSettings.menuItemPriceColor || "var(--gold-primary)");
            document.documentElement.style.setProperty("--menu-item-category-color", currentSettings.menuItemCategoryColor || "#888888");

            document.documentElement.style.setProperty("--font-footer", `'${footerFont}', ${footerFallback}`);
            document.documentElement.style.setProperty("--footer-font-size", currentSettings.footerFontSize || "0.9rem");
            document.documentElement.style.setProperty("--footer-color", currentSettings.footerColor || "#888888");

            document.documentElement.style.setProperty("--font-hero-title", `'${heroTitleFont}', ${heroTitleFallback}`);
            document.documentElement.style.setProperty("--hero-title-size", currentSettings.heroTitleFontSize || "5.2rem");
            document.documentElement.style.setProperty("--hero-title-color", currentSettings.heroTitleColor || "#ffffff");

            document.documentElement.style.setProperty("--font-hero-subtitle", `'${heroSubtitleFont}', ${heroSubtitleFallback}`);
            document.documentElement.style.setProperty("--hero-subtitle-size", currentSettings.heroSubtitleFontSize || "0.9rem");
            document.documentElement.style.setProperty("--hero-subtitle-color", currentSettings.heroSubtitleColor || "#d4af37");

            document.documentElement.style.setProperty("--font-hero-desc", `'${heroDescFont}', ${heroDescFallback}`);
            document.documentElement.style.setProperty("--hero-desc-size", currentSettings.heroDescFontSize || "1.1rem");
            document.documentElement.style.setProperty("--hero-desc-color", currentSettings.heroDescColor || "#e2e8f0");
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
