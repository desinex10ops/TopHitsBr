import * as React from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import styles from './AlbumDetails.module.css';
import { FiPlay, FiClock, FiDownload, FiShare2 } from 'react-icons/fi';
import { usePlayer } from '@/contexts/PlayerContext';
import { getStorageUrl } from '../../utils/urlUtils';
import CommentsSection from '../../components/Social/CommentsSection';
import ShareButton from '../../components/Social/ShareButton';
import LikeButton from '../../components/Social/LikeButton';

const AlbumDetails = () => {
    const { id } = useParams();
    const [album, setAlbum] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const { playTrack, setPlaylist } = usePlayer();

    React.useEffect(() => {
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
            <div className={styles.glassBackground}>
                <img
                    src={getStorageUrl(album.cover) || '/default-album.png'}
                    alt=""
                    className={styles.backgroundImage}
                />
            </div>

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

            <div className={styles.content}>
                <div className={styles.actions}>
                    <button className={styles.playBtn} onClick={() => handlePlay()}>
                        <FiPlay fill="currentColor" />
                    </button>
                    <button className={styles.actionBtn}><FiDownload /></button>
                    <ShareButton
                        title={`Ouça ${album.title} no TopHitsBr`}
                        text={`Ouça o álbum ${album.title} de ${album.Artist?.artisticName || 'Artista'}!`}
                        url={window.location.href}
                        className={styles.actionBtn}
                    />
                </div>

                <div className={styles.trackList}>
                    <div className={styles.trackHeader}>
                        <span className={styles.colIndex}>#</span>
                        <span className={styles.colTitle}>Título</span>
                        <span className={styles.colDuration}><FiClock /></span>
                    </div>
                    {[...(album.Tracks || [])]
                        .sort((a, b) => {
                            // Try to extract number from "X - Title" format
                            const getNum = (str) => {
                                const match = str.match(/^(\d+)/);
                                return match ? parseInt(match[1], 10) : Infinity;
                            };
                            const numA = getNum(a.title);
                            const numB = getNum(b.title);
                            if (numA !== numB) return numA - numB;
                            return a.title.localeCompare(b.title);
                        })
                        .map((track, idx) => (
                            <div key={track.id} className={styles.trackItem} onClick={() => handlePlay(track)}>
                                <span className={styles.colIndex}>{idx + 1}</span>
                                <div className={styles.colTitle}>
                                    <span className={styles.trackName}>{track.title}</span>
                                    <span className={styles.trackArtist}>{album.Artist?.artisticName || album.artist}</span>
                                </div>
                                <div className={styles.trackActions} onClick={(e) => e.stopPropagation()}>
                                    <LikeButton trackId={track.id} size={16} />
                                </div>
                                <span className={styles.colDuration}>{track.duration ? fmtDuration(track.duration) : '--:--'}</span>
                            </div>
                        ))}
                </div>

                <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <CommentsSection targetId={album.id} targetType="album" />
                </div>
            </div>
        </div>
    );
};

export default AlbumDetails;
