import { useState } from 'react';
import { FiPlus, FiPlay, FiTrash, FiMusic } from 'react-icons/fi';
import styles from './Dashboard.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Link } from 'react-router-dom';

const DashboardPlaylists = () => {
    const { user } = useAuth();
    const { playTrack, setPlaylist } = usePlayer();

    // Mock Data for now - replace with API call later
    const [playlists, setPlaylists] = useState([
        { id: 1, name: 'Minhas Curtidas', count: 12, cover: null },
        { id: 2, name: 'Para Relaxar', count: 8, cover: null },
        { id: 3, name: 'Treino Pesado', count: 24, cover: null },
    ]);

    const handleCreatePlaylist = () => {
        const name = prompt("Nome da nova playlist:");
        if (name) {
            setPlaylists([...playlists, {
                id: Date.now(),
                name,
                count: 0,
                cover: null
            }]);
        }
    };

    const handleDelete = (id, e) => {
        e.preventDefault(); // Prevent link click
        if (window.confirm("Tem certeza que deseja excluir esta playlist?")) {
            setPlaylists(playlists.filter(p => p.id !== id));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Minhas Playlists</h2>
                    <p className={styles.subtitle}>Gerencie suas coleções musicais</p>
                </div>
                <button className={styles.primaryBtn} onClick={handleCreatePlaylist}>
                    <FiPlus /> Nova Playlist
                </button>
            </div>

            <div className={styles.grid}>
                {playlists.map(playlist => (
                    <Link to={`/playlist/${playlist.id}`} key={playlist.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            {playlist.cover ? (
                                <img src={playlist.cover} alt={playlist.name} />
                            ) : (
                                <div className={styles.placeholderImage}>
                                    <FiMusic size={40} />
                                </div>
                            )}
                            <div className={styles.playOverlay}>
                                <button className={styles.playBtn} onClick={(e) => {
                                    e.preventDefault();
                                    // Logic to play whole playlist
                                    alert(`Dando play em ${playlist.name}`);
                                }}>
                                    <FiPlay />
                                </button>
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{playlist.name}</h3>
                            <p className={styles.cardSubtitle}>{playlist.count} músicas</p>
                        </div>
                        <button
                            className={styles.deleteBtn}
                            onClick={(e) => handleDelete(playlist.id, e)}
                            title="Excluir Playlist"
                        >
                            <FiTrash />
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardPlaylists;
