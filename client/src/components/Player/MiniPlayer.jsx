import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getStorageUrl } from '@/utils/urlUtils';
import styles from './MiniPlayer.module.css';
import { FiPlay, FiPause, FiSkipForward, FiHeart, FiMusic, FiShuffle, FiRepeat } from 'react-icons/fi';
import LikeButton from '../Social/LikeButton';
import AudioVisualizer from '../AudioVisualizer/AudioVisualizer';

const MiniPlayer = ({ onExpand }) => {
    const {
        currentTrack, isPlaying, togglePlay, playNext, currentTime, duration, themeColors,
        shuffle, repeatMode, toggleShuffle, toggleRepeat
    } = usePlayer();

    // if (!currentTrack) return null;

    const progress = (currentTime / duration) * 100 || 0;

    return (
        <div
            className={styles.container}
            style={{
                '--player-accent': themeColors.accent,
                '--player-bg': themeColors.primary
            }}
        >
            {/* Progress bar at the very top for mobile or as a subtle line */}
            <div className={styles.progressBarWrapper}>
                <div
                    className={styles.progressFill}
                    style={{
                        width: `${(currentTime / duration) * 100 || 0}%`,
                        backgroundColor: themeColors.accent
                    }}
                />
            </div>

            <div className={styles.content} onClick={currentTrack ? onExpand : undefined}>
                {/* Track Info */}
                <div className={styles.trackInfo}>
                    <div className={styles.coverWrapper}>
                        {currentTrack ? (
                            <img
                                src={getStorageUrl(currentTrack.coverpath)}
                                alt={currentTrack.title}
                                className={styles.cover}
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className={styles.placeholderCover}>
                                <FiMusic size={24} />
                            </div>
                        )}
                        {isPlaying && (
                            <div className={styles.miniVisualizer}>
                                <AudioVisualizer width={20} height={15} color={themeColors.accent} />
                            </div>
                        )}
                    </div>
                    <div className={styles.text}>
                        <span className={styles.title}>{currentTrack?.title || 'Nenhuma música'}</span>
                        <span className={styles.artist}>{currentTrack?.artist || 'Selecione para ouvir'}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls} onClick={(e) => e.stopPropagation()}>
                    <button
                        className={`${styles.controlBtn} ${shuffle ? styles.active : ''} ${styles.desktopOnly}`}
                        onClick={toggleShuffle}
                        disabled={!currentTrack}
                    >
                        <FiShuffle size={18} />
                    </button>

                    <button
                        className={styles.controlBtn}
                        onClick={togglePlay}
                        disabled={!currentTrack}
                    >
                        {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                    </button>

                    <button
                        className={styles.controlBtn}
                        onClick={playNext}
                        disabled={!currentTrack}
                    >
                        <FiSkipForward size={24} />
                    </button>

                    <button
                        className={`${styles.controlBtn} ${repeatMode !== 'off' ? styles.active : ''} ${styles.desktopOnly}`}
                        onClick={toggleRepeat}
                        disabled={!currentTrack}
                    >
                        <FiRepeat size={18} />
                    </button>
                </div>

                {/* Like Button - Desktop Only in Mini */}
                <div className={styles.desktopActions} onClick={(e) => e.stopPropagation()}>
                    {currentTrack ? (
                        <LikeButton trackId={currentTrack.id} />
                    ) : (
                        <button className={styles.actionBtn} disabled>
                            <FiHeart size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiniPlayer;
