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
    const pathname = usePathname();
    const { settings } = useSettings();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Story", href: "/#story" },
        { name: "Menu", href: "/menu" },
        { name: "Location", href: "/location" },
    ];

    return (
        <>
            {!pathname.startsWith('/admin') && !pathname.startsWith('/hr-admin') && !pathname.startsWith('/hr-portal') && (
                <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
                    <div className="navbar-container">
                        <Link href="/" className="logo">
                            {settings.logoType === "image" && settings.logoImageUrl ? (
                                <img src={settings.logoImageUrl} alt="Logo" style={{ height: "30px", width: "auto" }} />
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

            {!pathname.startsWith('/admin') && !pathname.startsWith('/hr-admin') && !pathname.startsWith('/hr-portal') && (
                <footer className="footer">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h2 className="logo-large">
                                {settings.logoType === "image" && settings.logoImageUrl ? (
                                    <img src={settings.logoImageUrl} alt="Logo" style={{ height: "40px", width: "auto" }} />
                                ) : (
                                    settings.logoText
                                )}
                            </h2>
                            <p className="footer-desc">{settings.footerTagline}</p>
                        </div>
                        <div className="footer-links">
                            <div className="link-group">
                                <h3>About</h3>
                                <Link href="/#story">Our Story</Link>
                                <Link href="/news">Press & News</Link>
                            </div>
                            <div className="link-group">
                                <h3>Contact</h3>
                                <p>📍 <a href={`https://map.naver.com/v5/search/${encodeURIComponent(settings.contactAddress)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-primary)", textDecoration: "underline" }}>{settings.contactAddress}</a></p>
                                <p>📞 {settings.contactPhone}</p>
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
