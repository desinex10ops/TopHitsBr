import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useState } = React;
import { Link } from 'react-router-dom';
import styles from './Player.module.css';
import { usePlayer } from '../../contexts/PlayerContext';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiTruck, FiShuffle, FiRepeat, FiList, FiBluetooth, FiShare2, FiType, FiPlusSquare } from 'react-icons/fi';
import CarModeOverlay from '../CarModeOverlay/CarModeOverlay';
import AudioVisualizer from '../AudioVisualizer/AudioVisualizer';
import LyricsView from '../LyricsView/LyricsView';
import QueueModal from './QueueModal';
import PlaylistModal from './PlaylistModal';
import BluetoothModal from '../BluetoothModal/BluetoothModal';
import { useToast } from '../../contexts/ToastContext';

const Player = () => {
    const {
        currentTrack, isPlaying, togglePlay, currentTime, duration, seek, volume, changeVolume, setCarMode,
        shuffle, repeatMode, toggleShuffle, toggleRepeat, playNext, playPrevious, addToPendrive
    } = usePlayer();

    const { addToast } = useToast();
    const [showQueue, setShowQueue] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showBluetoothModal, setShowBluetoothModal] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);

    // if (!currentTrack) return null; // Debug: Always render

    const trackTitle = currentTrack ? currentTrack.title : "Selecione uma música";
    const trackArtist = currentTrack ? currentTrack.artist : "---";
    const hasTrack = !!currentTrack;

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleEmbed = () => {
        if (!currentTrack) return;
        const nav = window.navigator;
        const code = `<iframe src="https://tophits.br/embed/${currentTrack.id}" width="100%" height="80" frameborder="0"></iframe>`;
        nav.clipboard.writeText(code).then(() => addToast("Código de incorporação copiado!", "success"));
    };

    const handleBluetooth = () => {
        setShowBluetoothModal(true);
    };

    const handleAddToPlaylist = () => {
        if (!currentTrack) return addToast("Selecione uma música primeiro.", "info");
        setShowPlaylistModal(true);
    };

    return (
        <div className={styles.playerContainer}>
            {/* Visualizer Pequeno no Topo do Player */}
            <div className={styles.visualizerContainer}>
                <AudioVisualizer width={300} height={40} color="#1db954" />
            </div>

            <div className={`container ${styles.inner}`}>
                <div className={styles.trackInfo}>
                    {hasTrack && currentTrack.coverpath ? (
                        <img src={getStorageUrl(currentTrack.coverpath)} alt="Capa" className={styles.cover} />
                    ) : (
                        <div className={styles.placeholder}>🎵</div>
                    )}
                    <div className={styles.details}>
                        <span className={styles.title}>{trackTitle}</span>
                        {currentTrack?.UserId ? (
                            <Link to={`/artist/${currentTrack.UserId}`} className={styles.artist} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                {trackArtist}
                            </Link>
                        ) : (
                            <span className={styles.artist}>{trackArtist}</span>
                        )}
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.buttons}>
                        <button
                            className={`${styles.controlBtn} ${shuffle ? styles.active : ''}`}
                            onClick={toggleShuffle}
                            title="Aleatório"
                        >
                            <FiShuffle style={{ fontSize: '1rem' }} />
                        </button>

                        <button className={styles.controlBtn} onClick={playPrevious} title="Anterior">
                            <FiSkipBack />
                        </button>

                        <button className={styles.playBtn} onClick={togglePlay} title={isPlaying ? "Pausar" : "Tocar"}>
                            {isPlaying ? <FiPause /> : <FiPlay />}
                        </button>

                        <button className={styles.controlBtn} onClick={playNext} title="Próxima">
                            <FiSkipForward />
                        </button>

                        <button
                            className={`${styles.controlBtn} ${repeatMode !== 'off' ? styles.active : ''}`}
                            onClick={toggleRepeat}
                            title={`Repetir: ${repeatMode === 'one' ? 'Uma' : repeatMode === 'all' ? 'Todas' : 'Não'}`}
                        >
                            <FiRepeat style={{ fontSize: '1rem' }} />
                            {repeatMode === 'one' && <span style={{ fontSize: '0.6rem', position: 'absolute', top: '8px' }}>1</span>}
                        </button>
                    </div>

                    <div className={styles.progressContainer}>
                        <span className={styles.time}>{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seek(Number(e.target.value))}
                            className={styles.progressBar}
                        />
                        <span className={styles.time}>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className={styles.extraControls}>
                    <div className={styles.desktopOnly}>
                        <button className={styles.controlBtn} onClick={handleAddToPlaylist} title="Adicionar à Playlist">
                            <FiPlusSquare style={{ fontSize: '1.2rem' }} />
                        </button>
                        <button className={styles.controlBtn} onClick={() => setShowQueue(true)} title="Fila de Reprodução">
                            <FiList style={{ fontSize: '1.2rem' }} />
                        </button>
                        <button
                            className={`${styles.controlBtn} ${showLyrics ? styles.active : ''}`}
                            onClick={() => setShowLyrics(!showLyrics)}
                            title="Letras"
                        >
                            <FiType style={{ fontSize: '1.2rem' }} />
                        </button>
                        <button className={styles.controlBtn} onClick={handleEmbed} title="Incorporar">
                            <FiShare2 style={{ fontSize: '1.2rem' }} />
                        </button>
                        <button className={styles.controlBtn} onClick={handleBluetooth} title="Dispositivos">
                            <FiBluetooth style={{ fontSize: '1.2rem' }} />
                        </button>
                        <button className={styles.carModeBtn} onClick={() => setCarMode(true)} title="Modo Carro">
                            <FiTruck />
                        </button>
                    </div>

                    <div className={styles.volumeContainer}>
                        <FiVolume2 />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => changeVolume(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--text-secondary)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showQueue && <QueueModal onClose={() => setShowQueue(false)} />}
            {showPlaylistModal && <PlaylistModal track={currentTrack} onClose={() => setShowPlaylistModal(false)} />}
            {showBluetoothModal && <BluetoothModal onClose={() => setShowBluetoothModal(false)} />}

            {showLyrics && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px', /* Altura do player */
                    right: '20px',
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    zIndex: 1500,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Letra da Música</span>
                        <button onClick={() => setShowLyrics(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <LyricsView />
                </div>
            )}
        </div>
    );
};

export default Player;
