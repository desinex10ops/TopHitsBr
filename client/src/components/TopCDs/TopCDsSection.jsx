import React, { useState } from 'react';
import RankedAlbumCard from './RankedAlbumCard';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import styles from './TopCDs.module.css';
import SectionHeader from '../SectionHeader/SectionHeader';

const TopCDsSection = ({ albums = [] }) => {
    const [period, setPeriod] = useState('MÊS');
    const [filterType, setFilterType] = useState('Ouvidas');

    // Sort albums based on the selected filter (mock logic for now if real stats aren't granular enough)
    // For demo, we just slice the top 6
    // Filter albums based on the selected period
    const filteredAlbums = albums.filter(album => {
        if (!album.createdAt) return true; // Fallback if no date
        const date = new Date(album.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (period === 'DIA') return diffDays <= 1;
        if (period === 'SEMANA') return diffDays <= 7;
        if (period === 'MÊS') return diffDays <= 30;
        return true; // GERAL
    });

    const topAlbums = filteredAlbums.slice(0, 6).map((album, index) => ({
        ...album,
        plays: album.plays ? (album.plays / 1000000).toFixed(1) : (Math.random() * 5).toFixed(1), // Use real stats if available or mock
        downloads: (Math.random() * 10).toFixed(1)
    }));

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.header}>
                <div className={styles.leftHeader}>
                    <div style={{ flex: 1 }}>
                        <SectionHeader title="TOP CDS" to="/top-cds" />
                    </div>
                    <div className={styles.periodFilters}>
                        {['DIA', 'SEMANA', 'MÊS', 'GERAL'].map((p) => (
                            <button
                                key={p}
                                className={`${styles.periodBtn} ${period === p ? styles.activePeriod : ''}`}
                                onClick={() => setPeriod(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.rightHeader}>
                    <div className={styles.dropdowns}>
                        <button className={styles.dropdownBtn}>
                            {filterType} <FiChevronDown />
                        </button>
                        <button className={styles.dropdownBtn}>
                            Todos <FiChevronDown />
                        </button>
                    </div>
                    <div className={styles.navArrows}>
                        <button className={styles.navBtn}><FiChevronLeft /></button>
                        <button className={styles.navBtn}><FiChevronRight /></button>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {topAlbums.map((album, index) => (
                    <RankedAlbumCard
                        key={album.id || index}
                        album={album}
                        rank={index + 1}
                    />
                ))}
            </div>
        </section>
    );
};

export default TopCDsSection;
