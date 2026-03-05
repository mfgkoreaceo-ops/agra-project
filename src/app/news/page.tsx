export const metadata = {
    title: "News & Events | Agra",
    description: "Check out the latest news and promotions at Agra.",
};

import Image from "next/image";
import styles from "./news.module.css";
import { Calendar } from "lucide-react";

const newsItems = [
    {
        id: 1,
        title: "Spring Festival Set Menu Released",
        date: "2026-03-01",
        tag: "Promotion",
        desc: "Celebrate the arrival of spring with our limited edition set menu featuring seasonal ingredients and refreshing new Lassi flavors.",
        image: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?auto=format&fit=crop&q=80"
    },
    {
        id: 2,
        title: "Agra Centerfield Yeoksam Grand Opening",
        date: "2026-01-15",
        tag: "News",
        desc: "We are thrilled to announce our newest premium dining location in the heart of Gangnam at Centerfield Yeoksam.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80"
    },
    {
        id: 3,
        title: "New Tandoori Platter Addition",
        date: "2025-11-20",
        tag: "Menu",
        desc: "Experience the ultimate barbecue with our new Royal Tandoori Platter, designed for sharing with friends and family.",
        image: "https://images.unsplash.com/photo-1599487405270-87331ca11ddc?auto=format&fit=crop&q=80"
    }
];

export default function NewsPage() {
    return (
        <div className={styles.newsContainer}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>News & Events</h1>
                <p className={styles.pageDesc}>Discover the latest updates, special offers, and new culinary experiences at Agra.</p>
            </div>

            <div className={styles.newsGrid}>
                {newsItems.map(item => (
                    <article key={item.id} className={styles.newsCard}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.tag}>{item.tag}</div>
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                className={styles.newsImage}
                            />
                        </div>
                        <div className={styles.content}>
                            <div className={styles.metaRow}>
                                <Calendar size={14} className={styles.icon} />
                                <time dateTime={item.date}>{item.date}</time>
                            </div>
                            <h2 className={styles.newsTitle}>{item.title}</h2>
                            <p className={styles.newsDesc}>{item.desc}</p>
                            <button className={styles.btnOutline}>Read More</button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
