import { getStorageUrl } from '../../utils/urlUtils';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeaturedArtists.module.css';
import api from '../../services/api';
import ImageWithFade from '../ImageWithFade/ImageWithFade';
import { usePlayer } from '@/contexts/PlayerContext';
import { FiPlay, FiUser, FiHeart, FiStar } from 'react-icons/fi';

const FeaturedArtists = () => {
    const [artists, setArtists] = useState([]);
    const [hoveredId, setHoveredId] = useState(null);
    const navigate = useNavigate();
    const { playTrack } = usePlayer();
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await api.get('/boost/featured-artists');
                setArtists(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error fetching featured:", error);
            }
        };
        fetchFeatured();
    }, []);

    const handleMouseMove = (e, id) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8; // Reduced for subtle effect
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget;
        card.style.setProperty('--rotateX', `0deg`);
        card.style.setProperty('--rotateY', `0deg`);
        setHoveredId(null);
    };

    const handlePlay = (e, artist) => {
        e.stopPropagation();
        if (artist.heroTrack) {
            playTrack(artist.heroTrack);
            if (artist.boostId) {
                api.post('/boost/interaction', { boostId: artist.boostId, type: 'play' })
                    .catch(err => console.error("Falha ao registrar interação:", err));
            }
        }
    };

    if (!artists || artists.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.backgroundGlow}></div>

            <div className={styles.header}>
                <h2 className={styles.title}>
                    <span className={styles.icon}>✨</span> Artistas em Destaque
                </h2>
                <span className={styles.subtitle}>Descubra o próximo hit através dos produtores mais influentes.</span>
            </div>

            <div className={styles.sliderContainer} ref={sliderRef}>
                <div className={styles.track}>
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
                            className={`
                                ${styles.card} 
                                ${hoveredId === artist.id ? styles.active : ''} 
                                ${hoveredId && hoveredId !== artist.id ? styles.inactive : ''}
                            `}
                            onMouseMove={(e) => handleMouseMove(e, artist.id)}
                            onMouseEnter={() => setHoveredId(artist.id)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => navigate(`/artist/${artist.id}`)}
                        >
                            <div className={styles.cardInner}>
                                <div className={styles.parallaxBg}>
                                    {artist.avatar ? (
                                        <ImageWithFade
                                            src={getStorageUrl(artist.avatar)}
                                            alt={artist.artisticName}
                                            className={styles.avatar}
                                        />
                                    ) : (
                                        <div className={styles.placeholder}>🎤</div>
                                    )}
                                </div>

                                <div className={styles.cardContent}>
                                    <div className={styles.badge}><FiStar /> DESTAQUE</div>
                                    <h3 className={styles.name}>{artist.artisticName}</h3>

                                    <div className={styles.actions}>
                                        <button
                                            className={styles.playBtn}
                                            onClick={(e) => handlePlay(e, artist)}
                                            title="Tocar Destaque"
                                        >
                                            <FiPlay />
                                        </button>
                                        <button className={styles.actionBtn} title="Ver Perfil">
                                            <FiUser />
                                        </button>
                                        <button className={styles.actionBtn} title="Favoritar">
                                            <FiHeart />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.cardGlow}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedArtists;
