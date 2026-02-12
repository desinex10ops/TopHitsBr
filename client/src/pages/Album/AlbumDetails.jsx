import * as React from 'react';
const { useState, useEffect } = React;
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import styles from './AlbumDetails.module.css';
import { FiPlay, FiClock, FiDownload, FiShare2 } from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';
import { getStorageUrl } from '../../utils/urlUtils';

const AlbumDetails = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const { playTrack, setPlaylist } = usePlayer();

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await api.get(`/music/albums/${id}`);
                setAlbum(res.data);
            } catch (error) {
                console.error('Erro ao buscar álbum:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [id]);

    const handlePlay = (track = null) => {
        if (!album || !album.Tracks) return;

        const playlist = album.Tracks.map(t => ({
            ...t,
            album: album.title,
            coverpath: album.cover,
            artist: album.Artist?.artisticName || "Desconhecido"
        }));

        setPlaylist(playlist);
        playTrack(track ? playlist.find(t => t.id === track.id) : playlist[0]);
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (!album) return <div className={styles.error}>Álbum não encontrado.</div>;

    const totalDuration = album.Tracks?.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const fmtDuration = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.coverWrapper}>
                    <img
                        src={getStorageUrl(album.cover) || '/default-album.png'}
                        alt={album.title}
                        className={styles.cover}
                    />
                </div>
                <div className={styles.info}>
                    <span className={styles.type}>Álbum</span>
                    <h1 className={styles.title}>{album.title}</h1>
                    <p className={styles.artist}>
                        {album.Artist?.avatar && (
                            <img src={getStorageUrl(album.Artist.avatar)} alt="" className={styles.artistAvatar} />
                        )}
                        {album.Artist?.artisticName || 'Artista Desconhecido'}
                    </p>
                    <p className={styles.meta}>
                        {album.year || '2023'} • {album.Tracks?.length || 0} músicas
                    </p>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.playBtn} onClick={() => handlePlay()}>
                    <FiPlay fill="currentColor" />
                </button>
                <button className={styles.actionBtn}><FiDownload /></button>
                <button className={styles.actionBtn}><FiShare2 /></button>
            </div>

            <div className={styles.trackList}>
                <div className={styles.trackHeader}>
                    <span className={styles.colIndex}>#</span>
                    <span className={styles.colTitle}>Título</span>
                    <span className={styles.colDuration}><FiClock /></span>
                </div>
                {album.Tracks?.map((track, idx) => (
                    <div key={track.id} className={styles.trackItem} onClick={() => handlePlay(track)}>
                        <span className={styles.colIndex}>{idx + 1}</span>
                        <div className={styles.colTitle}>
                            <span className={styles.trackName}>{track.title}</span>
                            <span className={styles.trackArtist}>{album.Artist?.artisticName}</span>
                        </div>
                        <span className={styles.colDuration}>{track.duration ? fmtDuration(track.duration) : '--:--'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlbumDetails;
