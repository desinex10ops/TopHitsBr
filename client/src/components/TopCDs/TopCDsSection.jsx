import * as React from 'react';
const { useState } = React;
import RankedAlbumCard from './RankedAlbumCard';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import styles from './TopCDs.module.css';

const TopCDsSection = ({ albums = [] }) => {
    const [period, setPeriod] = useState('MÊS');
    const [filterType, setFilterType] = useState('Ouvidas');

    // Sort albums based on the selected filter (mock logic for now if real stats aren't granular enough)
    // For demo, we just slice the top 6
    const topAlbums = albums.slice(0, 6).map((album, index) => ({
        ...album,
        plays: (Math.random() * 5).toFixed(1), // Mock stats if missing
        downloads: (Math.random() * 10).toFixed(1)
    }));

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.header}>
                <div className={styles.leftHeader}>
                    <h2 className={styles.sectionTitle}>TOP CDS</h2>
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
