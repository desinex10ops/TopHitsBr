import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';
import styles from '../Album/AlbumDetails.module.css'; // Reusing premium styles
import { FiPlay, FiHeart, FiClock, FiDownload, FiMoreHorizontal } from 'react-icons/fi';
import { getStorageUrl } from '../../utils/urlUtils';

const LikedSongs = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, setPlaylist, currentTrack, isPlaying } = usePlayer();
    const { addToast } = useToast();
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const loadFavorites = async () => {
            setLoading(true);
            try {
                // 1. Get IDs from localStorage
                const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                setFavorites(savedFavorites);

                if (savedFavorites.length === 0) {
                    setTracks([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch all tracks (or specific ones if API supported it)
                // Since we don't have a bulk fetch by ID endpoint yet, we fetch all and filter.
                // Optimally we should add `GET /music?ids=...`
                const response = await api.get('/music');
                const allTracks = response.data;

                const likedTracks = allTracks.filter(track => savedFavorites.includes(track.id));
                setTracks(likedTracks);

            } catch (error) {
                console.error("Erro ao carregar curtidas:", error);
                addToast("Erro ao carregar suas batidas.", "error");
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [addToast]);

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            setPlaylist(tracks);
            playTrack(tracks[0]);
        }
    };

    const handlePlayTrack = (track) => {
        setPlaylist(tracks);
        playTrack(track);
    };

    const removeFavorite = (trackId) => {
        const newFavorites = favorites.filter(id => id !== trackId);
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));

        // Remove from UI immediately
        setTracks(prev => prev.filter(t => t.id !== trackId));
        addToast("Removido dos favoritos.", "info");
    };

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.loading}>
                <div className="spinner"></div> Carregando suas curtidas...
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Gradient Background for Liked Songs */}
            <div className={styles.glassBackground} style={{ background: 'linear-gradient(to bottom, #5038a0, #121212)' }}>
            </div>

            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.coverWrapper}>
                        <div className={styles.coverPlaceholder} style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}>
                            <FiHeart fill="white" size={60} />
                        </div>
                    </div>
                    <div className={styles.info}>
                        <span className={styles.type}>PLAYLIST</span>
                        <h1 className={styles.title}>Músicas Curtidas</h1>
                        <div className={styles.meta}>
                            <span>{tracks.length} músicas</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {tracks.length > 0 && (
                        <button className={styles.playBtn} onClick={handlePlayAll} title="Tocar Tudo">
                            {isPlaying && tracks.some(t => t.id === currentTrack?.id) ? <FiPlay fill="black" /> : <FiPlay fill="black" style={{ marginLeft: '4px' }} />}
                        </button>
                    )}
                </div>

                {/* Tracklist */}
                <div className={styles.trackList}>
                    {tracks.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                            <h2>Sua biblioteca está vazia 😢</h2>
                            <p>Curta algumas músicas para elas aparecerem aqui!</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.trackHeader}>
                                <div style={{ textAlign: 'center' }}>#</div>
                                <div>Título</div>
                                <div style={{ textAlign: 'right' }}>Álbum</div>
                                <div style={{ textAlign: 'right' }}><FiClock /></div>
                            </div>

                            {tracks.map((track, index) => {
                                const isCurrent = currentTrack && currentTrack.id === track.id;
                                return (
                                    <div
                                        key={track.id}
                                        className={`${styles.trackItem} ${isCurrent ? styles.active : ''}`}
                                        onClick={() => handlePlayTrack(track)}
                                    >
                                        <div className={styles.trackIndex}>
                                            {isCurrent && isPlaying ? (
                                                <span className={styles.equalizerGif}>♫</span>
                                            ) : (
                                                <>
                                                    <span className={styles.indexNum}>{index + 1}</span>
                                                    <FiPlay className={styles.playIcon} onClick={() => handlePlayTrack(track)} />
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.trackInfo}>
                                            <div className={styles.trackName}>{track.title}</div>
                                            <div className={styles.trackArtist}>{track.artist}</div>
                                        </div>
                                        <div className={styles.trackAlbum} style={{ flex: 1, color: '#b3b3b3', fontSize: '0.9rem', textAlign: 'right', paddingRight: '20px' }}>
                                            {track.album}
                                        </div>

                                        <div className={styles.trackActions}>
                                            <button
                                                className={styles.actionBtn}
                                                style={{ fontSize: '1rem' }}
                                                onClick={(e) => { e.stopPropagation(); removeFavorite(track.id); }}
                                                title="Remover"
                                            >
                                                <FiHeart fill="#1ed760" color="#1ed760" />
                                            </button>
                                        </div>

                                        <div className={styles.trackDuration}>
                                            3:00
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikedSongs;
