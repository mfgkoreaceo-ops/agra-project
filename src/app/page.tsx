"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

import { useSettings } from "./SettingsContext";

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
        // Simple parallax effect
        heroRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
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
          <span className={`${styles["hero-subtitle"]} animate-fade-in`} style={{ animationDelay: "0.2s" }}>
            Welcome to
          </span>
          <h1 className={`${styles["hero-title"]} animate-fade-in`} style={{ animationDelay: "0.4s" }}>
            The Authentic Taste of India
          </h1>
          <Link href="/menu" className={`${styles["hero-cta"]} animate-fade-in`} style={{ animationDelay: "0.6s" }}>
            Explore Menu
          </Link>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="story" className={styles["philosophy-section"]}>
        <div className={styles["philosophy-container"]}>
          <div className={styles["philosophy-text"]}>
            <h2 className={styles["section-title"]}>{settings.philosophyTitle}</h2>
            <p className={styles["philosophy-desc"]}>
              {settings.philosophyDesc1}
            </p>
            <p className={styles["philosophy-desc"]}>
              {settings.philosophyDesc2}
            </p>
            <Link href="/#story" className={styles["hero-cta"]} style={{ marginTop: "1rem" }}>
              Our Story
            </Link>
          </div>
          <div className={styles["philosophy-image-container"]}>
            <div className={styles["gold-accent-box"]} />
            <Image
              src="https://images.unsplash.com/photo-1549429457-37c225026210?auto=format&fit=crop&q=80"
              alt="Indian Spices"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className={styles["philosophy-image"]}
            />
          </div>
        </div>
      </section>

      {/* Signature Menu Preview */}
      <section className={styles["signature-section"]}>
        <div className={styles["signature-container"]}>
          <div className={styles["signature-header"]}>
            <h2 className={styles["section-title"]}>Signature Dishes</h2>
          </div>

          <div className={styles["grid-showcase"]}>
            <Link href="/menu?category=curry" className={styles["menu-card"]}>
              <Image src={settings.signatureImage1} alt="Signature 1" fill style={{ objectFit: 'cover' }} className={styles["menu-card-img"]} sizes="(max-width: 768px) 100vw, 33vw" />
              <div className={styles["menu-card-content"]}>
                <h3 className={styles["menu-card-title"]}>Butter Chicken</h3>
                <span className={styles["menu-card-desc"]}>Curry</span>
              </div>
            </Link>

            <Link href="/menu?category=tandoori" className={styles["menu-card"]}>
              <Image src={settings.signatureImage2} alt="Signature 2" fill style={{ objectFit: 'cover' }} className={styles["menu-card-img"]} sizes="(max-width: 768px) 100vw, 33vw" />
              <div className={styles["menu-card-content"]}>
                <h3 className={styles["menu-card-title"]}>Tandoori Chicken</h3>
                <span className={styles["menu-card-desc"]}>Tandoori</span>
              </div>
            </Link>

            <Link href="/menu?category=naan" className={styles["menu-card"]}>
              <Image src={settings.signatureImage3} alt="Signature 3" fill style={{ objectFit: 'cover' }} className={styles["menu-card-img"]} sizes="(max-width: 768px) 100vw, 33vw" />
              <div className={styles["menu-card-content"]}>
                <h3 className={styles["menu-card-title"]}>Garlic Naan</h3>
                <span className={styles["menu-card-desc"]}>Bread</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
