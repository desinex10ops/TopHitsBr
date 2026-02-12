import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useState, useEffect } = React;
import styles from './RecommendedAlbums.module.css';
import { usePlayer } from '../../contexts/PlayerContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const RecommendedAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const { addToPendrive } = usePlayer();
    const { addToast } = useToast();

    useEffect(() => {
        // Simulando lógica de "Mais Adicionados". Na prática, pega aleatórios ou recentes do backend.
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('/music');
                const allTracks = res.data;

                // Agrupar por álbum
                const albumMap = {};
                allTracks.forEach(track => {
                    if (!albumMap[track.album]) {
                        albumMap[track.album] = {
                            album: track.album,
                            artist: track.artist,
                            coverpath: track.coverpath,
                            tracks: []
                        };
                    }
                    albumMap[track.album].tracks.push(track);
                });

                // Pegar 6 aleatórios para "recomendação"
                const albumList = Object.values(albumMap)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 6);

                setAlbums(albumList);
            } catch (error) {
                console.error("Erro ao carregar recomendações:", error);
            }
        };

        fetchRecommendations();
    }, []);

    const handleAddAlbum = (album) => {
        album.tracks.forEach(track => addToPendrive(track));
        addToast(`${album.album} adicionado ao Pen Drive!`, 'success');
    };

    if (albums.length === 0) return null;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Mais Adicionados <span>do Mês 🔥</span>
            </h2>
            <div className={styles.grid}>
                {albums.map((album, idx) => (
                    <div key={idx} className={styles.card} onClick={() => handleAddAlbum(album)}>
                        <div className={styles.coverWrapper}>
                            <div className={styles.badge}>#{idx + 1}</div>
                            {album.coverpath ? (
                                <img src={getStorageUrl(album.coverpath)} alt={album.album} className={styles.cover} />
                            ) : (
                                <div style={{ width: '100%', aspectRatio: 1, background: '#333' }}></div>
                            )}
                            <div className={styles.overlay}>
                                <button className={styles.addBtn}>+</button>
                            </div>
                        </div>
                        <div className={styles.albumName}>{album.album}</div>
                        <div className={styles.artistName}>{album.artist}</div>

                        <div className={styles.statsRow}>
                            <span className={styles.downloadCount}>
                                📥 {Math.floor(Math.random() * 500) + 120} baixaram hoje
                            </span>
                            <span className={styles.persuasiveText}>Não fique de fora!</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedAlbums;
