import * as React from 'react';
const { useRef, useEffect } = React;
import styles from './QueueModal.module.css';
import { FiX } from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';

const QueueModal = ({ onClose }) => {
    const { playlist, currentTrack, playTrack } = usePlayer();
    const currentRef = useRef(null);

    // Scroll to current track on open
    useEffect(() => {
        if (currentRef.current) {
            currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    if (!playlist || playlist.length === 0) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Fila de Reprodução</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className={styles.list}>
                    {playlist.map((track, index) => {
                        const isCurrent = currentTrack && track.id === currentTrack.id;
                        return (
                            <div
                                key={`${track.id}-${index}`}
                                className={`${styles.trackItem} ${isCurrent ? styles.active : ''}`}
                                onClick={() => {
                                    playTrack(track);
                                    // onClose(); // Optional: close on select or keep open?
                                }}
                                ref={isCurrent ? currentRef : null}
                            >
                                {isCurrent && <span className={styles.playingIcon}>♫</span>}
                                <div className={styles.trackInfo}>
                                    <span className={styles.trackTitle}>{track.title}</span>
                                    <span className={styles.trackArtist}>{track.artist}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QueueModal;
