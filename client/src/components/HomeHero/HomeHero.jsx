import React, { useState, useEffect } from 'react';
import { FiPlay, FiDownload, FiDisc } from 'react-icons/fi';
import { usePlayer } from '@/contexts/PlayerContext';
import { getStorageUrl } from '../../utils/urlUtils';
import api from '../../services/api';
import styles from './HomeHero.module.css';

const HomeHero = () => {
    const [heroItem, setHeroItem] = useState(null);
    const { playTrack } = usePlayer();

    useEffect(() => {
        // Fetch a featured item (could be from settings or random promoted track)
        const fetchHero = async () => {
            try {
                // For now, get the first promoted item or high-ranking track
                const [boostsRes, musicRes] = await Promise.all([
                    api.get('/credits/boost/active?type=album&limit=1').catch(() => ({ data: [] })),
                    api.get('/music?limit=1')
                ]);

                // Prefer boosts, fallback to music
                const boost = boostsRes.data?.[0]?.item;
                const track = musicRes.data?.[0];

                setHeroItem(boost || track);
            } catch (error) {
                console.error("Error fetching hero:", error);
            }
        };
        fetchHero();
    }, []);

    if (!heroItem) return null;

    const handlePlay = () => {
        playTrack(heroItem);
    };

    return (
        <div className={styles.container}>
            <div className={styles.label}>DESTAQUE</div>

            <div className={styles.card}>
                <div className={styles.imageWrapper}>
                    <img
                        src={getStorageUrl(heroItem.coverpath)}
                        alt={heroItem.title}
                        className={styles.image}
                    />
                    <div className={styles.overlay}></div>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>{heroItem.title}</h2>
                    <p className={styles.artist}>
                        {heroItem.artist} • {heroItem.genre || 'Música'}
                    </p>

                    <div className={styles.actions}>
                        <button className={styles.playBtn} onClick={handlePlay}>
                            <FiPlay fill="currentColor" /> TOCAR
                        </button>
                        <button className={styles.actionBtn}>
                            <FiDownload /> BAIXAR
                        </button>
                        <button className={styles.actionBtn}>
                            <FiDisc /> PEN DRIVE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeHero;
