"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "./SettingsContext";
import "./layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPromotion, setShowPromotion] = useState(false);
    const pathname = usePathname();
    const { settings } = useSettings();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);

        if (settings.isPromotionActive && settings.promotionImage && !pathname.startsWith('/admin') && !pathname.startsWith('/hr-')) {
            const closedDate = localStorage.getItem("agra_promotion_closed");
            if (closedDate !== new Date().toDateString()) {
                setShowPromotion(true);
            }
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, [settings.isPromotionActive, settings.promotionImage, pathname]);

    const closePromotion = () => {
        localStorage.setItem("agra_promotion_closed", new Date().toDateString());
        setShowPromotion(false);
    };

    const navLinks = [
        { name: "Menu", href: "/menu" },
        { name: "Location", href: "/location" },
    ];

    return (
        <>
            {!pathname.startsWith('/admin') && !pathname.startsWith('/hr-admin') && !pathname.startsWith('/hr-portal') && (
                <header
                    className={`navbar ${isScrolled ? "scrolled" : ""}`}
                    style={pathname !== "/" ? {
                        "--header-color": "var(--subpage-header-color)",
                        "--font-header": "var(--font-subpage-header)",
                        "--header-font-size": "var(--subpage-header-size)"
                    } as React.CSSProperties : {}}
                >
                    <div className="navbar-container">
                        <Link href="/" className="logo">
                            {settings.logoType === "image" && settings.logoImageUrl ? (
                                <img src={settings.logoImageUrl} alt="Logo" style={{ height: "45px", width: "auto", objectFit: "contain" }} />
                            ) : (
                                settings.logoText
                            )}
                        </Link>

                        <nav className="nav-desktop">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`nav-link ${pathname === link.href ? "active" : ""}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
                        <div className="mobile-nav-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="mobile-nav-link"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </header>
            )}

            <main>{children}</main>

            {/* Promotion Popup Modal */}
            {showPromotion && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999,
                    padding: "1rem", animation: "fadeIn 0.5s ease"
                }} onClick={closePromotion}>
                    <div style={{ position: "relative", maxWidth: "450px", width: "100%", background: "#0f1115", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
                        <button onClick={closePromotion} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
                        {settings.promotionLink ? (
                            <Link href={settings.promotionLink} onClick={closePromotion}>
                                <img src={settings.promotionImage} alt="Promotion" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", maxHeight: "60vh" }} />
                            </Link>
                        ) : (
                            <img src={settings.promotionImage} alt="Promotion" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", maxHeight: "60vh" }} />
                        )}
                        <div style={{ background: "var(--surface-dark)", padding: "1rem", display: "flex", justifyContent: "center" }}>
                            <button onClick={closePromotion} style={{ background: "transparent", color: "#a0a0a0", border: "none", cursor: "pointer", fontSize: "0.9rem", textDecoration: "underline" }}>오늘 하루 보지 않기</button>
                        </div>
                    </div>
                </div>
            )}

            {!pathname.startsWith('/admin') && !pathname.startsWith('/hr-admin') && !pathname.startsWith('/hr-portal') && (
                <footer className="footer">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h2 className="logo-large">
                                {settings.logoType === "image" && (settings.footerLogoImageUrl || settings.logoImageUrl) ? (
                                    <img src={settings.footerLogoImageUrl || settings.logoImageUrl} alt="Logo" style={{ height: "55px", width: "auto", objectFit: "contain" }} />
                                ) : (
                                    settings.logoText
                                )}
                            </h2>
                            <p className="footer-desc" style={{ fontFamily: `'${settings.footerTaglineFont}', sans-serif`, fontSize: settings.footerTaglineFontSize, color: settings.footerTaglineColor }}>{settings.footerTagline}</p>
                        </div>
                        <div className="footer-links">
                            <div className="link-group">
                                <h3 style={{ fontFamily: `'${settings.footerTitleFont}', serif`, fontSize: settings.footerTitleFontSize, color: settings.footerTitleColor }}>{settings.footerCompanyTitle}</h3>
                                <Link href="/menu">Menu</Link>
                                <Link href="/location">Location</Link>
                            </div>
                            <div className="link-group">
                                <h3 style={{ fontFamily: `'${settings.footerTitleFont}', serif`, fontSize: settings.footerTitleFontSize, color: settings.footerTitleColor }}>{settings.footerContactTitle}</h3>
                                <p><a href={`https://map.naver.com/v5/search/${encodeURIComponent(settings.contactAddress)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-primary)", textDecoration: "underline" }}>{settings.contactAddress}</a></p>
                                <p>{settings.contactPhone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Agra Holdings. All rights reserved.</p>
                    </div>
                </footer>
            )}
        </>
    );
}
