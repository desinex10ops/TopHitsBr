import * as React from 'react';
const { useState, useEffect, useRef } = React;
import {
    FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2,
    FiPlus, FiDownload, FiHeart, FiSave, FiDisc
} from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';
import { useToast } from '../../contexts/ToastContext';
import PlaylistModal from '../Player/PlaylistModal';
import styles from './MainBanner.module.css';
import api from '../../services/api';
import { getStorageUrl } from '../../utils/urlUtils';

const MainBanner = () => {
    const {
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        addToPendrive,
        toggleLike
    } = usePlayer();
    const { addToast } = useToast();

    const [highlights, setHighlights] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const videoRef = useRef(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Unmuted by default
    const [favorites, setFavorites] = useState([]);

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(savedFavorites);
    }, []);

    // Mock data for now, eventually fetch from API
    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                const [boostsRes, musicRes, settingsRes] = await Promise.all([
                    api.get('/credits/boost/active?type=album&limit=5').catch(() => ({ data: [] })),
                    api.get('/music'),
                    api.get('/music/admin/settings').catch(() => ({ data: {} }))
                ]);

                const boosts = boostsRes.data
                    .filter(b => b && b.item) // Safety check
                    .map(b => b.item);
                const tracks = musicRes.data;
                const settings = settingsRes.data;

                let finalHighlights = [];

                // 1. Manual Admin Highlights (Top Priority)
                if (settings.featured_track_ids) {
                    try {
                        const manualIds = JSON.parse(settings.featured_track_ids);
                        console.log("MainBanner - Parsed Manual IDs:", manualIds);

                        const manualTracks = tracks.filter(t => manualIds.includes(t.id));
                        console.log("MainBanner - Found Manual Tracks:", manualTracks);

                        // Maintain order of IDs
                        manualIds.forEach(id => {
                            const track = manualTracks.find(t => t.id === id);
                            if (track) finalHighlights.push(track);
                        });
                    } catch (e) {
                        console.error("Error parsing featured_track_ids", e);
                    }
                }

                // 2. Premium Boosts (If slots available)
                if (finalHighlights.length < 5) {
                    for (let boost of boosts) {
                        // Avoid duplicates
                        if (!finalHighlights.find(h => h.id === boost.id)) {
                            finalHighlights.push(boost);
                        }
                        if (finalHighlights.length >= 5) break;
                    }
                }

                // 3. Settings Banner (If slots available)
                if (finalHighlights.length < 5 && settings.banner_title) {
                    const linkedTrackId = settings.banner_track_id ? parseInt(settings.banner_track_id) : null;
                    const linkedTrack = linkedTrackId ? tracks.find(t => t.id === linkedTrackId) : null;

                    finalHighlights.push({
                        id: 'banner-custom',
                        title: settings.banner_title,
                        artist: settings.banner_subtitle || 'Destaque',
                        album: 'TopHitsBr',
                        genre: 'Destaque',
                        coverpath: settings.banner_image || (linkedTrack ? linkedTrack.coverpath : null), // Fallback to linked track cover
                        videopath: settings.banner_video || null,
                        filepath: '',
                        isCustom: true,
                        audioType: settings.banner_audio_type || 'video',
                        linkedTrackId,
                        linkedTrack
                    });
                }

                // 4. Fill with Random Albums
                if (finalHighlights.length < 5) {
                    const seenAlbums = new Set(finalHighlights.map(h => h.album));
                    for (let track of tracks) {
                        if (!seenAlbums.has(track.album) && !finalHighlights.find(t => t.id === track.id)) {
                            seenAlbums.add(track.album);
                            finalHighlights.push(track);
                        }
                        if (finalHighlights.length >= 5) break;
                    }
                }

                setHighlights(finalHighlights.slice(0, 5));

            } catch (error) {
                console.error("Error fetching highlights:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHighlights();
    }, []);

    // Auto-carousel
    const [timeLeft, setTimeLeft] = useState(10);

    // Auto-carousel
    useEffect(() => {
        if (highlights.length === 0) return;
        const interval = setInterval(() => {
            // Only auto-advance if not currently playing audio or video
            if ((!isPlaying || (currentTrack?.id !== highlights[currentIndex]?.id)) && !isVideoPlaying) {
                // setCurrentIndex((prev) => (prev + 1) % highlights.length); 
                // Setup: User asked for countdown to "Next". We might want to disable auto-advance or align it.
                // Keeping auto-advance at 30s but giving manual option after 10s.
            }
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [highlights, currentIndex, isPlaying, currentTrack, isVideoPlaying]);

    // Countdown Timer
    useEffect(() => {
        setTimeLeft(10);
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleNextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % highlights.length);
    };

    const handlePreviousSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
    };



    const activeItem = highlights[currentIndex];
    console.log("MainBanner ActiveItem:", activeItem);

    // Reset video state when slide changes
    useEffect(() => {
        // Try to play unmuted immediately
        setIsVideoPlaying(true);
        setIsMuted(false);

        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = false; // Unmute

            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsVideoPlaying(true);
                }).catch(error => {
                    console.log("Autoplay unmuted blocked, falling back to muted:", error);
                    // Fallback: Muted Autoplay if browser blocks audio
                    videoRef.current.muted = true;
                    setIsMuted(true);
                    videoRef.current.play();
                });
            }
        } else {
            // If it's audio (no videopath), try to play audio track
            if (activeItem && !activeItem.videopath && !activeItem.isCustom) {
                // Note: Global player might conflict. 
                // If we want banner AUDIO to autoplay, we might need to hook into usePlayer. 
                // For now, let's assume this request is primarily for the VIDEO banner context or general "play".
                // If it's a song, we should probably start playing it.
                if (currentTrack?.id !== activeItem.id && !isPlaying) {
                    playTrack(activeItem);
                }
            }
        }
    }, [currentIndex, activeItem]);

    if (loading || !activeItem) return <div className={styles.skeletonBanner}></div>;

    const isCurrentTrackPlaying = currentTrack?.id === activeItem.id && isPlaying;
    // Helper to know if WE (the video) are playing with sound
    const isVideoActive = activeItem.videopath && isVideoPlaying;

    const handlePlay = () => {
        if (activeItem.videopath) {
            // Video Logic
            if (videoRef.current) {
                if (isVideoPlaying) {
                    // Pause Video
                    videoRef.current.pause();
                    setIsVideoPlaying(false);
                } else {
                    // Play Video (Unmuted)
                    // 1. Pause Global Player
                    if (isPlaying) togglePlay();

                    // 2. Play Video
                    videoRef.current.muted = false;
                    setIsMuted(false);
                    videoRef.current.play()
                        .then(() => setIsVideoPlaying(true))
                        .catch(err => console.error("Video play error:", err));
                }
            }
        } else {
            // Standard Audio Logic
            if (activeItem.isCustom) {
                if (activeItem.videopath && isVideoPlaying) {
                    // Video is already playing, do nothing or pause?
                } else {
                    addToast("Este é um banner promocional. A música não está vinculada.", "info");
                }
                return;
            }

            if (isCurrentTrackPlaying) {
                togglePlay();
            } else {
                playTrack(activeItem);
            }
        }
    };

    const handleAddToPlaylist = () => {
        if (activeItem.isCustom) return;
        setShowPlaylistModal(true);
    };

    const handleAddToPendrive = () => {
        if (activeItem.isCustom) return;
        addToPendrive(activeItem);
    };

    const handleDownload = () => {
        if (activeItem.isCustom) return;
        // Implement download logic or link
        const link = document.createElement('a');
        link.href = getStorageUrl(activeItem.filepath); // Using utility
        link.download = `${activeItem.artist} - ${activeItem.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Download iniciado!", "success");
    };

    const toggleFavorite = (track) => {
        if (!track || track.isCustom) return;

        let newFavorites;
        if (favorites.includes(track.id)) {
            newFavorites = favorites.filter(id => id !== track.id);
            addToast("Removido dos favoritos", "info");
        } else {
            newFavorites = [...favorites, track.id];
            addToast("Adicionado aos favoritos", "success");
        }
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const isFavorite = activeItem && !activeItem.isCustom && favorites.includes(activeItem.id);

    return (
        <div className={styles.bannerContainer}>
            {/* Background: Video or Image */}
            {activeItem.videopath ? (
                <video
                    key={activeItem.id}
                    ref={videoRef}
                    className={styles.bannerVideo}
                    src={getStorageUrl(activeItem.videopath)}
                    poster={getStorageUrl(activeItem.coverpath)}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                />
            ) : (
                <div
                    className={styles.bannerBackground}
                    style={{ backgroundImage: `url(${getStorageUrl(activeItem.coverpath)})` }}
                >
                </div>
            )}

            <div className={styles.overlay}></div>

            <div className={styles.content}>
                <div className={styles.infoSection}>
                    <span className={styles.label}>DESTAQUE</span>
                    <h1 className={styles.title}>
                        {(() => {
                            const text = activeItem.title || "";
                            const parts = text.split(' ');
                            if (parts.length > 1) {
                                return (
                                    <>
                                        <span style={{ display: 'block' }}>{parts[0]}</span>
                                        <span style={{ display: 'block' }}>{parts.slice(1).join(' ')}</span>
                                    </>
                                );
                            }
                            return text;
                        })()}
                    </h1>
                    <h2 className={styles.subtitle}>
                        {activeItem.artist} • {activeItem.album}
                    </h2>
                    <p className={styles.description}>
                        O melhor do {activeItem.genre} você ouve aqui.
                    </p>

                    <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePlay}>
                            {activeItem.videopath ? (
                                // Video Controls
                                isVideoPlaying ? <><FiPause /> PAUSAR VÍDEO</> : <><FiPlay /> ASSISTIR VÍDEO</>
                            ) : (
                                // Audio Controls (Custom or Standard)
                                isCurrentTrackPlaying ? <><FiPause /> PAUSAR</> : <><FiPlay /> TOCAR AGORA</>
                            )}
                        </button>

                        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleAddToPlaylist}>
                            <FiPlus /> Playlist
                        </button>

                        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleAddToPendrive}>
                            <FiSave /> Pen Drive
                        </button>

                        <button className={`${styles.btn} ${styles.btnIcon}`} onClick={handleDownload} title="Baixar">
                            <FiDownload />
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnIcon}`}
                            title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                            onClick={() => toggleFavorite(activeItem)}
                        >
                            <FiHeart
                                fill={isFavorite ? "#1ed760" : "none"}
                                color={isFavorite ? "#1ed760" : "white"}
                            />
                        </button>
                    </div>

                    <div className={`${styles.equalizer} ${(isCurrentTrackPlaying || isVideoPlaying) ? '' : styles.paused}`}>
                        {[...Array(10)].map((_, i) => <div key={i} className={styles.bar}></div>)}
                    </div>
                </div>

                <div className={styles.visualSection}>
                    <div className={styles.coverWrapper} onClick={handleDownload}>
                        <img
                            src={getStorageUrl(activeItem.coverpath)}
                            alt={activeItem.title}
                            className={`${styles.coverImage} ${(isCurrentTrackPlaying || isVideoPlaying) ? styles.playing : ''}`}
                        />
                        <div className={styles.downloadOverlay}>
                            <div className={styles.downloadBtn}>
                                <FiDownload className={styles.downloadIcon} />
                                <span>BAIXE AGORA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carousel Indicators */}
            <div className={styles.indicators}>
                {highlights.map((_, idx) => (
                    <button
                        key={idx}
                        className={`${styles.indicator} ${idx === currentIndex ? styles.activeIndicator : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>

            {showPlaylistModal && (
                <PlaylistModal
                    track={activeItem}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}

            {/* Previous Slide Control */}
            <div className={styles.prevControl}>
                <button className={styles.navBtn} onClick={handlePreviousSlide}>
                    ⏮ VOLTAR
                </button>
            </div>

            {/* Next Slide Control */}
            <div className={styles.nextControl}>
                {timeLeft > 0 ? (
                    <div className={styles.timerCircle}>
                        <svg viewBox="0 0 36 36" className={styles.circularChart}>
                            <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className={styles.circle} strokeDasharray={`${(timeLeft / 10) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className={styles.timerText}>{timeLeft}</span>
                    </div>
                ) : (
                    <button className={styles.nextBtn} onClick={handleNextSlide}>
                        PRÓXIMO ⏭
                    </button>
                )}
            </div>
        </div>
    );
};

export default MainBanner;
