import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
import styles from './CarModeOverlay.module.css';
import { usePlayer } from '../../contexts/PlayerContext';

const CarModeOverlay = () => {
    const {
        carMode,
        setCarMode,
        currentTrack,
        isPlaying,
        togglePlay,
        playTrack,
        playlist,
        currentTime,
        duration,
        playNext, // Use context shortcut
        playPrevious // Use context shortcut
    } = usePlayer();

    // Fechar se não estiver ativo
    if (!carMode) return null;

    // Calcular progresso
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Formatar tempo 00:00
    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className={styles.overlay}>
            <button className={styles.closeBtn} onClick={() => setCarMode(false)}>✕ SAIR</button>

            <div className={styles.content}>
                {currentTrack ? (
                    <>
                        <div className={styles.coverWrapper}>
                            {currentTrack.coverpath ? (
                                <img src={getStorageUrl(currentTrack.coverpath)} alt={currentTrack.title} className={styles.cover} />
                            ) : (
                                <div className={styles.placeholder}>🎵</div>
                            )}
                        </div>

                        <div className={styles.info}>
                            <h1 className={styles.title}>{currentTrack.title}</h1>
                            <h2 className={styles.artist}>{currentTrack.artist}</h2>
                        </div>

                        <div className={styles.progressContainer}>
                            <span className={styles.time}>{formatTime(currentTime)}</span>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className={styles.time}>{formatTime(duration)}</span>
                        </div>

                        <div className={styles.controls}>
                            <button className={styles.controlBtn} onClick={playPrevious}>⏮</button>
                            <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={togglePlay}>
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <button className={styles.controlBtn} onClick={playNext}>⏭</button>
                        </div>
                    </>
                ) : (
                    <h1 className={styles.title} style={{ textAlign: 'center' }}>Toque uma música para começar</h1>
                )}
            </div>
        </div>
    );
};

export default CarModeOverlay;
