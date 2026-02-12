import * as React from 'react';
import PackCard from './PackCard';
import styles from './EarnMoney.module.css';

const FeaturedPacksCarousel = () => {
    // Mock Data
    const packs = [
        {
            id: 1,
            title: "Revoada do Tubarão",
            creator: "DJ Shark",
            price: "9,90",
            rating: 5,
            downloads: 1250,
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"
        },
        {
            id: 2,
            title: "Pisadinha 2026",
            creator: "Os Barões",
            price: "9,90",
            rating: 4,
            downloads: 850,
            cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&q=80"
        },
        {
            id: 3,
            title: "Funk Consciente",
            creator: "MC Hariel",
            price: "9,90",
            rating: 5,
            downloads: 2100,
            cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=500&q=80"
        },
        {
            id: 4,
            title: "Modão Sertanejo",
            creator: "Gusttavo",
            price: "9,90",
            rating: 5,
            downloads: 3400,
            cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=500&q=80"
        },
        {
            id: 5,
            title: "Eletro Vibe",
            creator: "Alok",
            price: "9,90",
            rating: 4,
            downloads: 900,
            cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&q=80"
        }
    ];

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>🔥 Packs em Destaque</h2>
                <span className={styles.sectionSubtitle}>Os mais vendidos da semana</span>
            </div>

            <div className={styles.carouselGrid}>
                {packs.map(pack => (
                    <PackCard key={pack.id} pack={pack} />
                ))}
            </div>
        </div>
    );
};

export default FeaturedPacksCarousel;
