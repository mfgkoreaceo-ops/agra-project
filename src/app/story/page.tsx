"use client";

import Image from "next/image";
import styles from "./story.module.css";
import { useEffect, useRef } from "react";

export default function StoryPage() {
    const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            parallaxRefs.current.forEach((el, index) => {
                if (el) {
                    const speed = 0.2 + (index * 0.1);
                    const yPos = -(window.scrollY * speed);
                    el.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !parallaxRefs.current.includes(el)) {
            parallaxRefs.current.push(el);
        }
    };

    return (
        <div className={styles.storyContainer}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroBg} ref={addToRefs} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80')" }} />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <span className={`${styles.subtitle} animate-fade-up`}>The Heritage</span>
                    <h1 className={`${styles.title} animate-fade-up`} style={{ animationDelay: "0.2s" }}>
                        Rooted in Tradition,<br />Perfected for Today.
                    </h1>
                </div>
            </section>

            {/* Chapter 1 */}
            <section className={styles.chapterSection}>
                <div className={styles.contentGrid}>
                    <div className={styles.textContent}>
                        <h2 className={styles.chapterTitle}>Origin of Agra</h2>
                        <div className={styles.goldLine} />
                        <p className={styles.chapterText}>
                            AGRA is named after the historic city in Northern India, the home of the Taj Mahal. Before New Delhi became the capital, Agra was the heart of the empire, carrying the traditional charm and rich culinary heritage of India.
                        </p>
                        <p className={styles.chapterText}>
                            Our journey began with a simple yet profound desire: to bring the authentic, royal flavors of the Mughal era to the modern dining tables of Seoul.
                        </p>
                    </div>
                    <div className={styles.imageContent}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80"
                                alt="Taj Mahal"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Full Width Image Break */}
            <section className={styles.bannerSection}>
                <div className={styles.bannerBg} ref={addToRefs} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596797882870-8c33dee86647?auto=format&fit=crop&q=80')" }} />
                <div className={styles.bannerOverlay} />
                <div className={styles.bannerContent}>
                    <h2 className={styles.bannerText}>"A symphony of spices, carefully orchestrated."</h2>
                </div>
            </section>

            {/* Chapter 2 */}
            <section className={`${styles.chapterSection} ${styles.reversed}`}>
                <div className={styles.contentGrid}>
                    <div className={styles.textContent}>
                        <h2 className={styles.chapterTitle}>The Art of Spices</h2>
                        <div className={styles.goldLine} />
                        <p className={styles.chapterText}>
                            Indian cuisine is an alchemy of spices. We source the finest, most aromatic ingredients directly from local farms in India.
                            From the earthy warmth of cumin to the floral notes of cardamom, every dish is an intricate balance of flavors.
                        </p>
                        <p className={styles.chapterText}>
                            We roast and grind our own spice blends daily, ensuring that every bite delivers an unforgettable sensory experience.
                        </p>
                    </div>
                    <div className={styles.imageContent}>
                        <div className={`${styles.imageWrapper} ${styles.offsetImage}`}>
                            <Image
                                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80"
                                alt="Spices"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className={styles.timelineSection}>
                <h2 className={styles.timelineHeader}>Our Milestone</h2>
                <div className={styles.timelineContainer}>
                    <div className={styles.timelineItem}>
                        <div className={styles.year}>2008</div>
                        <div className={styles.event}>
                            <h3>First Door Opened</h3>
                            <p>Founding the very first AGRA location in Itaewon, Seoul.</p>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.year}>2015</div>
                        <div className={styles.event}>
                            <h3>Expansion</h3>
                            <p>Launched multiple premium dining branches across the city, adapting traditional flavors to fine dining standards.</p>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.year}>2024</div>
                        <div className={styles.event}>
                            <h3>A New Era</h3>
                            <p>Celebrating over a decade of excellence, modernizing the brand experience for the new generation.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
