import * as React from 'react';
const { useState, useEffect } = React;
import styles from './PlaylistModal.module.css';
import { FiX, FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const PlaylistModal = ({ track, onClose }) => {
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const { addToast } = useToast();
    const { user } = useAuth(); // Assuming we have auth context, though api middleware handles it. Authenticated user needed.

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        try {
            const response = await api.get('/music/playlists/user');
            setPlaylists(response.data);
        } catch (error) {
            console.error("Erro ao carregar playlists:", error);
            // addToast("Erro ao carregar playlists.", "error"); 
            // Silent fail or prompt login?
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            const response = await api.post('/music/playlists', { name: newPlaylistName });
            setPlaylists([response.data, ...playlists]);
            setNewPlaylistName('');
            addToast("Playlist criada!", "success");
        } catch (error) {
            console.error("Erro ao criar playlist:", error);
            addToast("Erro ao criar playlist.", "error");
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        try {
            await api.post(`/music/playlists/${playlistId}/tracks`, { trackId: track.id });
            addToast(`Adicionada à playlist!`, "success");
            onClose();
        } catch (error) {
            console.error("Erro ao adicionar:", error);
            addToast("Erro ao adicionar à playlist.", "error");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Adicionar à Playlist</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className={styles.createSection}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Nova Playlist..."
                        value={newPlaylistName}
                        onChange={e => setNewPlaylistName(e.target.value)}
                    />
                    <button className={styles.createBtn} onClick={handleCreatePlaylist}>
                        <FiPlus />
                    </button>
                </div>

                <div className={styles.list}>
                    {playlists.length === 0 && (
                        <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                            Nenhuma playlist encontrada.
                        </div>
                    )}
                    {playlists.map(pl => (
                        <div key={pl.id} className={styles.playlistItem} onClick={() => handleAddToPlaylist(pl.id)}>
                            <div className={styles.iconPlaceholder}>🎵</div>
                            <div className={styles.info}>
                                <span className={styles.name}>{pl.name}</span>
                                <span className={styles.count}>Playlist • Pessoal</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlaylistModal;
