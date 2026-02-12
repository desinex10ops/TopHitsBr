import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useEffect, useState } = React;
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './FeaturedBanner.module.css';

const FeaturedBanner = ({ track }) => {
    const { playTrack, addToPendrive } = usePlayer();

    if (!track) return null;

    return (
        <div
            className={styles.banner}
            style={{
                backgroundImage: `url(${getStorageUrl(track.coverpath)})`
            }}
        >
            <div className={styles.gradientVertical}>
                <div className={styles.gradientHorizontal}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>{track.title}</h1>
                        <div className={styles.info}>
                            <span className={styles.points}>Destaque</span>
                            <span className={styles.artist}>{track.artist}</span>
                        </div>
                        <div className={styles.description}>
                            Ouvir agora o novo sucesso de {track.artist}.
                            Disponível em alta qualidade no TopHitsBr.
                        </div>
                        <div className={styles.buttons}>
                            <button className={styles.playBtn} onClick={() => playTrack(track)}>
                                ▶ Assistir
                            </button>
                            <button className={styles.addBtn} onClick={() => addToPendrive(track)}>
                                ➕ Minha Lista
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedBanner;
