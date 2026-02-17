import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { FiEdit, FiTrash2, FiMic, FiSearch } from 'react-icons/fi';
import styles from './AdminTracks.module.css';
import KaraokeModal from './KaraokeModal';
import EditTrackModal from './EditTrackModal';
import { getStorageUrl } from '../../../utils/urlUtils';

const AdminTracks = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            const response = await api.get('/admin/tracks');
            setTracks(response.data);
        } catch (error) {
            console.error('Erro ao buscar músicas:', error);
            addToast('Erro ao carregar músicas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta música?')) return;
        try {
            await api.delete(`/admin/tracks/${id}`);
            setTracks(tracks.filter(t => t.id !== id));
            addToast('Música excluída!', 'success');
        } catch (error) {
            addToast('Erro ao excluir música.', 'error');
        }
    };

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [trackToEdit, setTrackToEdit] = useState(null);

    const openEditModal = (track) => {
        setTrackToEdit(track);
        setIsEditModalOpen(true);
    };

    const handleUpdateTrack = (updatedTrack) => {
        setTracks(tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t));
    };

    // Karaoke Modal State
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [isKaraokeModalOpen, setIsKaraokeModalOpen] = useState(false);

    const openKaraokeModal = (track) => {
        setSelectedTrack(track);
        setIsKaraokeModalOpen(true);
    };

    const handleSaveKaraoke = async (trackId, lyrics, instrumentalFile) => {
        const formData = new FormData();
        formData.append('lyrics', lyrics);
        if (instrumentalFile) {
            formData.append('karaoke', instrumentalFile);
        }

        try {
            await api.patch(`/music/${trackId}/karaoke`, formData);

            addToast('Karaokê atualizado com sucesso!', 'success');

            // Update local track state
            setTracks(tracks.map(t =>
                t.id === trackId
                    ? { ...t, hasKaraoke: true, lyrics: lyrics, karaokeFile: instrumentalFile ? 'updated' : t.karaokeFile }
                    : t
            ));
        } catch (error) {
            console.error(error);
            addToast('Erro ao salvar Karaokê.', 'error');
        }
    };

    // Bulk Selection State
    const [selectedTracks, setSelectedTracks] = useState([]);

    const toggleSelectAll = () => {
        if (selectedTracks.length === filteredTracks.length) {
            setSelectedTracks([]);
        } else {
            setSelectedTracks(filteredTracks.map(t => t.id));
        }
    };

    const toggleSelectTrack = (id) => {
        if (selectedTracks.includes(id)) {
            setSelectedTracks(selectedTracks.filter(tid => tid !== id));
        } else {
            setSelectedTracks([...selectedTracks, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja excluir ${selectedTracks.length} músicas?`)) return;

        try {
            // Delete sequentially or parallel? Parallel is faster but risky for many items.
            await Promise.all(selectedTracks.map(id => api.delete(`/music/${id}`)));

            setTracks(tracks.filter(t => !selectedTracks.includes(t.id)));
            setSelectedTracks([]);
            addToast(`${selectedTracks.length} músicas excluídas!`, 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao excluir algumas músicas.', 'error');
        }
    };

    // Filter Logic
    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Gerenciar Músicas</h2>
                <div className={styles.actionsHeader}>
                    {selectedTracks.length > 0 && (
                        <button className={styles.btnDeleteBulk} onClick={handleBulkDelete}>
                            <FiTrash2 /> Excluir ({selectedTracks.length})
                        </button>
                    )}
                    <div className={styles.searchBox}>
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Buscar por título ou artista..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? <p>Carregando...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={filteredTracks.length > 0 && selectedTracks.length === filteredTracks.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Capa</th>
                                <th>Título</th>
                                <th>Artista</th>
                                <th>Karaokê</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTracks.map(track => (
                                <tr key={track.id} className={selectedTracks.includes(track.id) ? styles.selectedRow : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedTracks.includes(track.id)}
                                            onChange={() => toggleSelectTrack(track.id)}
                                        />
                                    </td>
                                    <td>
                                        <img
                                            src={track.coverpath ? getStorageUrl(track.coverpath) : '/default-cover.png'}
                                            alt={track.title}
                                            className={styles.cover}
                                        />
                                    </td>
                                    <td>{track.title}</td>
                                    <td>{track.artist}</td>
                                    <td>
                                        {track.hasKaraoke ? (
                                            <span className={styles.badgeSuccess}>Ativo</span>
                                        ) : (
                                            <span className={styles.badgeInactive}>Inativo</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.btnIcon} ${track.featured ? styles.btnFeatured : ''}`}
                                                title={track.featured ? "Remover Destaque" : "Destacar"}
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.patch(`/admin/tracks/${track.id}/feature`);
                                                        setTracks(tracks.map(t => t.id === track.id ? { ...t, featured: res.data.featured } : t));
                                                        addToast(res.data.featured ? 'Música destacada!' : 'Destaque removido.', 'success');
                                                    } catch (err) {
                                                        addToast('Erro ao destacar.', 'error');
                                                    }
                                                }}
                                            >
                                                <FiStar fill={track.featured ? "currentColor" : "none"} />
                                            </button>
                                            <button
                                                className={styles.btnIcon}
                                                title="Editar"
                                                onClick={() => openEditModal(track)}
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                className={styles.btnIcon}
                                                title="Gerenciar Karaokê"
                                                onClick={() => openKaraokeModal(track)}
                                            >
                                                <FiMic />
                                            </button>
                                            <button className={`${styles.btnIcon} ${styles.btnDelete}`} onClick={() => handleDelete(track.id)} title="Excluir">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedTrack && (
                <KaraokeModal
                    isOpen={isKaraokeModalOpen}
                    onClose={() => setIsKaraokeModalOpen(false)}
                    track={selectedTrack}
                    onSave={handleSaveKaraoke}
                />
            )}

            {isEditModalOpen && (
                <EditTrackModal
                    track={trackToEdit}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleUpdateTrack}
                />
            )}
        </div>
    );
};

export default AdminTracks;
