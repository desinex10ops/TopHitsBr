import { getStorageUrl } from '../../utils/urlUtils';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Admin.module.css'; // Reusing styles for now
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const AdminTracks = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            const response = await api.get('/music');
            setTracks(response.data);
        } catch (error) {
            console.error('Erro ao buscar músicas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (track) => {
        setTrackToDelete(track);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (!trackToDelete) return;

        try {
            await api.delete(`/music/${trackToDelete.id}`);
            setTracks(tracks.filter(track => track.id !== trackToDelete.id));
            addToast('Música excluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            addToast('Erro ao excluir música.', 'error');
        } finally {
            setShowModal(false);
            setTrackToDelete(null);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h2>Gerenciar Músicas</h2>
                <Link to="/upload" className={styles.newBtn}>+ Nova Música</Link>
            </div>

            {loading ? <p>Carregando...</p> : (
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Capa</th>
                                <th>Título</th>
                                <th>Artista</th>
                                <th>Gênero</th>
                                <th>Plays</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map(track => (
                                <tr key={track.id}>
                                    <td>
                                        {track.coverpath && (
                                            <img src={getStorageUrl(track.coverpath)} alt="Capa" className={styles.thumb} />
                                        )}
                                    </td>
                                    <td>{track.title}</td>
                                    <td>{track.artist}</td>
                                    <td>{track.genre || '-'}</td>
                                    <td>{track.plays || 0}</td>
                                    <td>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteClick(track)}
                                        >
                                            🗑 Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmModal
                isOpen={showModal}
                title="Excluir Música"
                message={`Tem certeza que deseja excluir "${trackToDelete?.title}"? Essa ação não pode ser desfeita.`}
                onConfirm={confirmDelete}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
};

export default AdminTracks;
