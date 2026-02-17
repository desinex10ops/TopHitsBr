import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Library.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getStorageUrl } from '../../utils/urlUtils';
import { FiMusic, FiDisc, FiUser, FiHeart } from 'react-icons/fi';

const Library = () => {
    const [activeTab, setActiveTab] = useState('tracks');
    const [data, setData] = useState({ tracks: [], playlists: [], following: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const response = await api.get('/users/library');
            setData(response.data);
        } catch (error) {
            console.error("Erro ao carregar biblioteca:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Minha Biblioteca</h1>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'tracks' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tracks')}
                >
                    Músicas Curtidas ({data.tracks.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'playlists' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('playlists')}
                >
                    Playlists Salvas ({data.playlists.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'artists' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('artists')}
                >
                    Artistas Seguidos ({data.following.length})
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'tracks' && (
                    <div className={styles.trackList}>
                        {data.tracks.length === 0 ? (
                            <div className={styles.emptyState}>Você ainda não curtiu nenhuma música.</div>
                        ) : (
                            data.tracks.map(track => (
                                <Link to={`/album/${track.AlbumId || ''}`} key={track.id} className={styles.trackItem}>
                                    <img
                                        src={getStorageUrl(track.coverpath || track.Album?.cover || 'default-cover.jpg')}
                                        alt={track.title}
                                        className={styles.trackCover}
                                    />
                                    <div className={styles.trackInfo}>
                                        <span className={styles.trackTitle}>{track.title}</span>
                                        <span className={styles.trackArtist}>{track.artist}</span>
                                    </div>
                                    <div className={styles.trackActions}>
                                        <FiHeart style={{ fill: '#1db954', color: '#1db954' }} />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'playlists' && (
                    <div className={styles.grid}>
                        {data.playlists.length === 0 ? (
                            <div className={styles.emptyState}>Você ainda não salvou nenhuma playlist.</div>
                        ) : (
                            data.playlists.map(playlist => (
                                <Link to={`/playlist/${playlist.id}`} key={playlist.id} className={styles.card}>
                                    <img
                                        src={getStorageUrl(playlist.cover || 'default-playlist.jpg')}
                                        alt={playlist.name}
                                        className={styles.cardImage}
                                    />
                                    <div className={styles.cardTitle}>{playlist.name}</div>
                                    <div className={styles.cardSub}>Por {playlist.User?.name || 'Usuário'}</div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'artists' && (
                    <div className={styles.grid}>
                        {data.following.length === 0 ? (
                            <div className={styles.emptyState}>Você ainda não segue ninguém.</div>
                        ) : (
                            data.following.map(user => (
                                <Link to={`/user/${user.id}`} key={user.id} className={styles.artistCard}>
                                    <img
                                        src={getStorageUrl(user.avatar || 'default-avatar.png')}
                                        alt={user.name}
                                        className={styles.artistImage}
                                    />
                                    <span className={styles.artistName}>{user.artisticName || user.name}</span>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Library;
