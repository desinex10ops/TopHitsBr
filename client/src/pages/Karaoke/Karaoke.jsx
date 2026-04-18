import { getStorageUrl } from '../../utils/urlUtils';
import React, { useState, useEffect } from 'react';
import styles from './Karaoke.module.css';
import { FiMic, FiMoreHorizontal, FiDownload, FiPlusCircle, FiX, FiPlay } from 'react-icons/fi';
import api from '../../services/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';

const genres = [
    { name: 'Sertanejo', icon: '🎸', color: '#ff6b6b' },
    { name: 'Forró', icon: '🪗', color: '#4ecdc4' },
    { name: 'Piseiro', icon: '🔥', color: '#ffbe76' },
    { name: 'Arrocha', icon: '💃', color: '#ff7979' },
    { name: 'Funk', icon: '🎤', color: '#badc58' },
    { name: 'Gospel', icon: '🙏', color: '#7ed6df' },
    { name: 'Infantil', icon: '👶', color: '#e056fd' },
];

const Karaoke = () => {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [karaokeMode, setKaraokeMode] = useState(false);
    const [currentKaraoke, setCurrentKaraoke] = useState(null);

    // Lyrics State
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    const { addToast } = useToast();
    const { playTrack } = usePlayer();

    // Mock Data for Demo
    const mockLyrics = [
        "Preparando o microfone...",
        "3...",
        "2...",
        "1...",
        "Essa é a letra da música de teste",
        "Cantando com emoção e alegria",
        "O sistema de karaokê é incrível",
        "TopHitsBR inovando sempre!",
    ];

    useEffect(() => {
        if (selectedGenre) {
            loadTracks(selectedGenre);
        } else {
            // Load featured/all
            loadTracks();
        }
    }, [selectedGenre]);

    const loadTracks = async (genre = '') => {
        setLoading(true);
        try {
            // In a real scenario, we would filter by 'hasKaraoke=true'
            const endpoint = genre ? `/music/genres/${genre}` : '/music';
            const res = await api.get(endpoint);
            setTracks(res.data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar músicas.", "error");
        } finally {
            setLoading(false);
        }
    };

    const startKaraoke = (track) => {
        setCurrentKaraoke(track);
        setKaraokeMode(true);

        // Simular Lyrics Sync
        let line = 0;
        const interval = setInterval(() => {
            setCurrentLineIndex(prev => {
                if (prev >= mockLyrics.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000); // Change line every 3s for demo

        // Play Instrumental (if available, otherwise play original)
        // In real impl, check track.karaokeFile
        // playTrack(track); 
    };

    const closeKaraoke = () => {
        setKaraokeMode(false);
        setCurrentKaraoke(null);
        setCurrentLineIndex(0);
    };

    return (
        <div className={styles.container}>
            {!karaokeMode ? (
                <>
                    <div className={styles.hero}>
                        <h1 className={styles.title}>🎤 Modo Karaokê</h1>
                        <p className={styles.subtitle}>Escolha, Cante e Divirta-se. Selecione um gênero ou uma música abaixo e solte a voz!</p>
                    </div>

                    <div className={styles.sectionTitle}>Escolha um Gênero</div>
                    <div className={styles.genreGrid}>
                        {genres.map(g => (
                            <div
                                key={g.name}
                                className={styles.genreCard}
                                onClick={() => setSelectedGenre(g.name === selectedGenre ? '' : g.name)}
                                style={{ borderColor: selectedGenre === g.name ? 'var(--dynamic-accent)' : '#333' }}
                            >
                                <div className={styles.genreIcon}>{g.icon}</div>
                                <div className={styles.genreName}>{g.name}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.sectionTitle}>
                        {selectedGenre ? `Karaokês de ${selectedGenre}` : 'Músicas Disponíveis'}
                    </div>

                    <div className={styles.tracksList}>
                        {tracks.map(track => (
                            <div key={track.id} className={styles.trackCard}>
                                <img
                                    src={getStorageUrl(track.coverpath) || '/default-cover.png'}
                                    className={styles.cover}
                                    alt={track.title}
                                />
                                <div className={styles.info}>
                                    <div className={styles.trackName}>{track.title}</div>
                                    <div className={styles.artistName}>{track.artist}</div>
                                    {track.hasKaraoke && <span className={styles.karaokeBadge}>🎤 Letra Sincronizada</span>}
                                </div>
                                <div className={styles.actions}>
                                    <button className={`${styles.actionBtn} ${styles.playBtn}`} onClick={() => startKaraoke(track)}>
                                        <FiMic /> Cantar
                                    </button>
                                    <button className={styles.actionBtn} title="Adicionar Playlist"><FiPlusCircle /></button>
                                    <button className={styles.actionBtn} title="Baixar"><FiDownload /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                // PLAYER KARAOKÊ OVERLAY (SIMPLIFIED FOR MVP)
                <div className={styles.karaokeOverlay}>
                    <button className={styles.closeKaraoke} onClick={closeKaraoke}><FiX /></button>

                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <img
                            src={getStorageUrl(currentKaraoke?.coverpath) || '/default-cover.png'}
                            style={{ width: '200px', height: '200px', borderRadius: '10px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                        />
                        <h2 style={{ marginTop: '20px', fontSize: '2rem' }}>{currentKaraoke?.title}</h2>
                        <h3 style={{ color: '#888' }}>{currentKaraoke?.artist}</h3>
                    </div>

                    <div className={styles.lyricsArea}>
                        {mockLyrics.map((line, idx) => (
                            <div
                                key={idx}
                                className={`${styles.lyricLine} ${idx === currentLineIndex ? styles.activeLine : ''}`}
                                style={{
                                    opacity: Math.abs(currentLineIndex - idx) > 2 ? 0 : 1 - (Math.abs(currentLineIndex - idx) * 0.3)
                                }}
                            >
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* Controls Placeholder */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '20px', background: '#222', padding: '20px', borderRadius: '50px' }}>
                        <button className={styles.actionBtn}><FiPlay /></button>
                        <span style={{ alignSelf: 'center' }}>Tom: 0</span>
                        <span style={{ alignSelf: 'center' }}>Velocidade: 1.0x</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Karaoke;
