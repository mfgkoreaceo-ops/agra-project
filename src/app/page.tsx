"use client";

import React from "react"; // Added React import
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

import { SiteSettings, useSettings } from "./SettingsContext"; // Added SiteSettings import

// Helper to fix accidentally typed 7-digit hex colors (e.g. #0000000 -> #000000)
const getSafeColor = (color: string | undefined, fallback: string) => {
  if (!color) return fallback;
  if (color.startsWith("#") && color.length === 8) return color.substring(0, 7);
  return color;
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fallback if settings.heroImages is not available or empty
  const heroImages = settings.heroImages?.length ? settings.heroImages : [settings.heroImage];

  // Logic to auto-slide images
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        // Subtle parallax: Move down slightly as user scrolls down
        heroRef.current.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className={styles["hero-section"]}>
        <div ref={heroRef} className={styles["hero-parallax-wrapper"]}>
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`${styles["hero-bg"]} ${index === currentSlideIndex ? styles["active"] : ""}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className={styles["hero-overlay"]} />
        <div className={styles["hero-content"]}>
          <span className={`${styles["hero-subtitle"]} animate-fade-up`} style={{ animationDelay: "0.2s" }}>
            {settings.heroSubtitle}
          </span>
          <h1 className={`${styles["hero-title"]} animate-fade-up`} style={{ animationDelay: "0.4s" }}>
            {settings.heroTitle?.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className={`${styles["hero-desc"]} animate-fade-up`} style={{ animationDelay: "0.6s", marginBottom: "2.5rem" }}>
            {settings.heroDesc?.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </p>
          <Link href="/menu" className={`${styles["hero-cta"]} animate-fade-up`} style={{
            animationDelay: "0.8s",
            "--btn-color": settings.heroBtnColor || "var(--gold-primary)",
            fontFamily: `'${settings.heroBtnFont || 'Inter'}', sans-serif`
          } as React.CSSProperties}>
            Explore Menu
          </Link>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="story" className={styles["philosophy-section"]}>
        <div className={styles["philosophy-container"]}>
          <div className={styles["philosophy-text"]}>
            <h2 className={styles["section-title"]} style={{ fontFamily: "var(--font-philosophy-title)", fontSize: settings.philosophyTitleFontSize, color: settings.philosophyTitleColor, textAlign: settings.philosophyTextAlign || "left", whiteSpace: "pre-wrap" }}>
              {settings.philosophyTitle}
            </h2>
            <p className={styles["philosophy-desc"]} style={{ fontFamily: "var(--font-philosophy-desc)", fontSize: settings.philosophyDescFontSize, color: settings.philosophyDescColor, textAlign: settings.philosophyTextAlign || "left", whiteSpace: "pre-wrap" }}>
              {settings.philosophyDesc1?.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </p>
            <p className={styles["philosophy-desc"]} style={{ fontFamily: "var(--font-philosophy-desc)", fontSize: settings.philosophyDescFontSize, color: settings.philosophyDescColor, textAlign: settings.philosophyTextAlign || "left", whiteSpace: "pre-wrap" }}>
              {settings.philosophyDesc2?.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </p>
          </div>
          <div className={styles["philosophy-image-container"]}>
            {settings.philosophyImage && (
              <Image
                src={settings.philosophyImage}
                alt="Philosophy Image"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className={styles["philosophy-image"]}
              />
            )}
          </div>
        </div>
      </section>

      {/* Signature Menu Preview */}
      <section className={styles["signature-section"]}>
        <div className={styles["signature-container"]}>
          <div className={styles["signature-header"]}>
            <h2 className={styles["section-title"]} style={{ fontFamily: "var(--font-signature)", fontSize: settings.signatureFontSize || "2.5rem", color: getSafeColor(settings.signatureColor, "#fdfdfd") }}>
              {settings.signatureTitle ?? "Signature Dishes"}
            </h2>
          </div>

          <div className={styles["grid-showcase"]}>
            <Link href="/menu?category=curry" className={styles["menu-card"]}>
              <div className={styles["menu-card-img-wrapper"]}>
                <Image src={settings.signatureImage1} alt="Signature 1" fill style={{ objectFit: 'cover' }} className={styles["menu-card-img"]} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className={styles["menu-card-content"]}>
                <h3 className={styles["menu-card-title"]} style={{ fontFamily: "var(--font-signature)", color: getSafeColor(settings.signatureNameColor, "#fdfdfd") }}>{settings.signatureName1 ?? "Butter Chicken"}</h3>
                <span className={styles["menu-card-desc"]} style={{ color: getSafeColor(settings.signatureDescColor, "#fdfdfd"), opacity: 0.8 }}>{settings.signatureDesc1 ?? "Rich Tomato Curry"}</span>
              </div>
            </Link>

            <Link href="/menu?category=tandoori" className={styles["menu-card"]}>
              <div className={styles["menu-card-img-wrapper"]}>
                <Image src={settings.signatureImage2} alt="Signature 2" fill style={{ objectFit: 'cover' }} className={styles["menu-card-img"]} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className={styles["menu-card-content"]}>
                <h3 className={styles["menu-card-title"]} style={{ fontFamily: "var(--font-signature)", color: getSafeColor(settings.signatureNameColor, "#fdfdfd") }}>{settings.signatureName2 ?? "Tandoori Chicken"}</h3>
                <span className={styles["menu-card-desc"]} style={{ color: getSafeColor(settings.signatureDescColor, "#fdfdfd"), opacity: 0.8 }}>{settings.signatureDesc2 ?? "Clay Oven Roasted"}</span>
              </div>
            </Link>

            <Link href="/menu?category=naan" className={styles["menu-card"]}>
              <div className={styles["menu-card-img-wrapper"]}>
                <Image src={settings.signatureImage3} alt="Signature 3" fill style={{ objectFit: 'cover' }} className={styles["menu-card-img"]} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className={styles["menu-card-content"]}>
                <h3 className={styles["menu-card-title"]} style={{ fontFamily: "var(--font-signature)", color: getSafeColor(settings.signatureNameColor, "#fdfdfd") }}>{settings.signatureName3 ?? "Garlic Naan"}</h3>
                <span className={styles["menu-card-desc"]} style={{ color: getSafeColor(settings.signatureDescColor, "#fdfdfd"), opacity: 0.8 }}>{settings.signatureDesc3 ?? "Fresh Baked Bread"}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
