import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getStorageUrl } from '@/utils/urlUtils';
import styles from './FullscreenPlayer.module.css';
import {
    FiPlay, FiPause, FiSkipBack, FiSkipForward,
    FiShuffle, FiRepeat, FiVolume2, FiMaximize2,
    FiChevronDown, FiPlusCircle, FiShare2, FiMoreVertical, FiHeart,
    FiList, FiMic, FiBluetooth, FiPlusSquare, FiAirplay
} from 'react-icons/fi';
import LikeButton from '../Social/LikeButton';
import AudioVisualizer from '../AudioVisualizer/AudioVisualizer';

const FullscreenPlayer = ({ onMinimize }) => {
    const {
        currentTrack, isPlaying, togglePlay, playNext, playPrevious,
        currentTime, duration, seek, volume, changeVolume,
        shuffle, repeatMode, toggleShuffle, toggleRepeat, themeColors
    } = usePlayer();

    const [showLyrics, setShowLyrics] = useState(false);

    // Swipe logic
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isSwipeDown = distance < -minSwipeDistance;
        if (isSwipeDown) {
            onMinimize();
        }
    };

    if (!currentTrack) return null;

    const progress = (currentTime / duration) * 100 || 0;

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div
            className={styles.overlay}
            style={{ '--accent': themeColors.accent }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Ambient Background */}
            <div className={styles.ambientBg}>
                <img
                    src={getStorageUrl(currentTrack.coverpath)}
                    alt=""
                    className={styles.bgImage}
                    crossOrigin="anonymous"
                />
                <div className={styles.gradientOverlay} />
            </div>

            <div className={styles.content}>
                {/* Header */}
                <header className={styles.header}>
                    <button className={styles.iconBtn} onClick={onMinimize}>
                        <FiChevronDown size={28} />
                    </button>
                    <div className={styles.headerInfo}>
                        <span className={styles.playingFrom}>TOCANDO DE</span>
                        <span className={styles.originName}>Sua Biblioteca</span>
                    </div>
                    <button className={styles.iconBtn}>
                        <FiMoreVertical size={24} />
                    </button>
                </header>

                {/* Cover Art Area */}
                <main className={styles.playerMain}>
                    <div className={styles.coverContainer}>
                        <img
                            src={getStorageUrl(currentTrack.coverpath)}
                            alt={currentTrack.title}
                            className={`${styles.mainCover} ${isPlaying ? styles.spinning : ''}`}
                            crossOrigin="anonymous"
                        />
                        <div className={styles.glow} style={{ boxShadow: `0 20px 80px ${themeColors.accent}40` }} />
                    </div>

                    {/* Track Info */}
                    <div className={styles.trackDetails}>
                        <div className={styles.titleArtist}>
                            <h1 className={styles.title}>{currentTrack.title}</h1>
                            <p className={styles.artist}>{currentTrack.artist || 'Artista Desconhecido'}</p>
                        </div>
                        <LikeButton trackId={currentTrack.id} className={styles.bigLikeBtn} />
                    </div>

                    {/* Visualizer */}
                    <div className={styles.visualizerBox}>
                        <AudioVisualizer width={350} height={60} color={themeColors.accent} />
                    </div>

                    {/* Progress Control */}
                    <div className={styles.progressSection}>
                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={(e) => seek(Number(e.target.value))}
                                className={styles.progressBar}
                                style={{ '--progress': `${progress}%` }}
                            />
                        </div>
                        <div className={styles.timeLabels}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Primary Controls */}
                    <div className={styles.mainControls}>
                        <button
                            className={`${styles.secondaryBtn} ${shuffle ? styles.active : ''}`}
                            onClick={toggleShuffle}
                        >
                            <FiShuffle size={20} />
                        </button>

                        <button className={styles.primaryBtn} onClick={playPrevious}>
                            <FiSkipBack size={32} />
                        </button>

                        <button className={styles.playBtn} onClick={togglePlay}>
                            {isPlaying ? <FiPause size={40} /> : <FiPlay size={40} />}
                        </button>

                        <button className={styles.primaryBtn} onClick={playNext}>
                            <FiSkipForward size={32} />
                        </button>

                        <button
                            className={`${styles.secondaryBtn} ${repeatMode !== 'off' ? styles.active : ''}`}
                            onClick={toggleRepeat}
                        >
                            <FiRepeat size={20} />
                            {repeatMode === 'one' && <span className={styles.repeatBadge}>1</span>}
                        </button>
                    </div>
                </main>

                {/* Footer Controls */}
                <footer className={styles.footer}>
                    <div className={styles.footerLeft}>
                        <button
                            className={`${styles.footerBtn} ${showLyrics ? styles.active : ''}`}
                            title="Letras"
                            onClick={() => setShowLyrics(!showLyrics)}
                        >
                            <FiMic size={20} />
                        </button>
                        <button className={styles.footerBtn} title="Espelhamento / Airplay">
                            <FiAirplay size={20} />
                        </button>
                        <button className={styles.footerBtn} title="Bluetooth/Conectar">
                            <FiBluetooth size={20} />
                        </button>
                    </div>

                    <div className={styles.volumeBox}>
                        <FiVolume2 size={18} />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => changeVolume(Number(e.target.value))}
                            className={styles.volumeSlider}
                        />
                    </div>

                    <div className={styles.footerRight}>
                        <button className={styles.footerBtn} title="Adicionar à Playlist">
                            <FiPlusSquare size={20} />
                        </button>
                        <button className={styles.footerBtn} title="Fila/Lista">
                            <FiList size={20} />
                        </button>
                    </div>
                </footer>
            </div>

            {/* Lyrics Overlay */}
            {showLyrics && (
                <div className={styles.lyricsOverlay} onClick={() => setShowLyrics(false)}>
                    <div className={styles.lyricsContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.lyricsHeader}>
                            <h2>Letras</h2>
                            <button className={styles.closeLyrics} onClick={() => setShowLyrics(false)}><FiX /></button>
                        </div>
                        <div className={styles.lyricsBody}>
                            <p className={styles.lyricsText}>
                                {currentTrack.lyrics || `A letra de "${currentTrack.title}" não está disponível no momento. \n\n Artistas podem cadastrar a letra no painel de upload!`}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FullscreenPlayer;
