import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useState, useEffect } = React;
import { useNavigate } from 'react-router-dom';
import styles from './FeaturedArtists.module.css';
import api from '../../services/api';
import ImageWithFade from '../ImageWithFade/ImageWithFade';

import { usePlayer } from '../../contexts/PlayerContext';

const FeaturedArtists = () => {
    const [artists, setArtists] = useState([]);
    const navigate = useNavigate();
    const { playTrack } = usePlayer();

    useEffect(() => {
        const fetchDeep = async () => {
            try {
                const res = await api.get('/boost/featured-artists');
                setArtists(res.data);
            } catch (error) {
                console.error("Error fetching featured:", error);
            }
        };
        fetchDeep();
    }, []);

    if (!artists || artists.length === 0) return null;

    const handlePlay = (e, artist) => {
        e.stopPropagation();
        if (artist.heroTrack) {
            playTrack(artist.heroTrack);
            // Registrar clique/play para impulsionamento
            if (artist.boostId) {
                api.post('/boost/interaction', { boostId: artist.boostId, type: 'play' })
                    .catch(err => console.error("Falha ao registrar interação:", err));
            }
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>🚀 Artistas em Destaque</h2>
                <span className={styles.subtitle}>O melhor da música, selecionado para você</span>
            </div>

            <div className={styles.grid}>
                {artists.map((artist, index) => (
                    <div
                        key={`${artist.id}-${index}`}
                        className={styles.card}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                    >
                        <div className={styles.avatarWrapper}>
                            {artist.avatar ? (
                                <ImageWithFade src={getStorageUrl(artist.avatar)} alt={artist.artisticName} className={styles.avatar} />
                            ) : (
                                <div className={styles.placeholder}>🎤</div>
                            )}

                            {/* Play Overlay - Only if track exists */}
                            {artist.heroTrack && (
                                <div className={styles.playOverlay} onClick={(e) => handlePlay(e, artist)}>
                                    <span className={styles.playIcon}>▶</span>
                                </div>
                            )}

                            <div className={styles.badge}>PRO</div>
                        </div>
                        <span className={styles.name}>{artist.artisticName}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedArtists;
