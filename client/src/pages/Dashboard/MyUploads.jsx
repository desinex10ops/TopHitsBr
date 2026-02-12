import * as React from 'react';
const { useEffect, useState } = React;
import styles from './MyUploads.module.css';
import api from '../../services/api';
import { FiUploadCloud, FiTrash2, FiEdit, FiMusic, FiX, FiPlay, FiDownload, FiPlusSquare, FiArrowLeft, FiTrendingUp } from 'react-icons/fi';
import Upload from '../Upload/Upload';
import { useToast } from '../../contexts/ToastContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import BoostModal from '../../components/BoostModal/BoostModal';
import EditAlbumModal from '../../components/Album/EditAlbumModal';
import { getStorageUrl } from '../../utils/urlUtils';

const MyUploads = () => {
    const { user } = useAuth();
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null); // Album object

    // Boost State
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [boostItem, setBoostItem] = useState(null);
    const [boostType, setBoostType] = useState('track');

    // Edit Album State
    const [editingAlbum, setEditingAlbum] = useState(null);

    const handleBoost = (item, type, e) => {
        if (e) e.stopPropagation();
        setBoostItem(item);
        setBoostType(type);
        setShowBoostModal(true);
    };

    const { addToast } = useToast();
    const { playTrack, setPlaylist } = usePlayer();

    const fetchAlbums = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get(`/music/artist/${user.id}/albums`);
            setAlbums(res.data);

            // Update selected album if open
            if (selectedAlbum) {
                const updated = res.data.find(a => a.id === selectedAlbum.id);
                if (updated) setSelectedAlbum(updated);
            }
        } catch (error) {
            console.error("Erro ao buscar álbuns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, [user]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Tem certeza que deseja excluir esta música?")) return;

        try {
            await api.delete(`/music/${id}`);
            addToast("Música excluída com sucesso!", "success");
            fetchAlbums(); // Refresh all
        } catch (error) {
            console.error("Erro ao excluir:", error);
            addToast("Erro ao excluir música.", "error");
        }
    };

    const handlePlayAlbum = (album) => {
        if (!album.Tracks || !album.Tracks.length) return;

        const playlist = album.Tracks.map(t => ({
            ...t,
            album: album.title,
            artist: album.UserId === user.id ? user.artisticName : 'Artist',
            coverpath: album.cover
        }));

        setPlaylist(playlist);
        playTrack(playlist[0]);
    };

    const handlePlayTrack = (track) => {
        // Tocar a música e colocar o resto do álbum na fila
        if (!selectedAlbum || !selectedAlbum.Tracks) return;

        const playlist = selectedAlbum.Tracks.map(t => ({
            ...t,
            album: selectedAlbum.title,
            coverpath: selectedAlbum.cover
        }));

        const trackToPlay = playlist.find(t => t.id === track.id);
        setPlaylist(playlist);
        playTrack(trackToPlay);
    };

    const handleDownload = (track) => {
        const link = document.createElement('a');
        link.href = getStorageUrl(track.filepath);
        link.download = `${track.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {selectedAlbum && (
                        <button className={styles.backBtn} onClick={() => setSelectedAlbum(null)}>
                            <FiArrowLeft />
                        </button>
                    )}
                    <h2 className={styles.title}>{selectedAlbum ? selectedAlbum.title : 'Meus Álbuns'}</h2>
                </div>
                <button className={styles.uploadBtn} onClick={() => setShowUploadModal(true)}>
                    <FiUploadCloud /> Novo Upload
                </button>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : albums.length === 0 ? (
                <div className={styles.emptyState}>
                    <FiMusic className={styles.emptyIcon} />
                    <h3>Você ainda não enviou nenhuma música.</h3>
                    <p>Comece a divulgar seu trabalho agora mesmo!</p>
                </div>
            ) : !selectedAlbum ? (
                /* Visão de Álbuns (Grid) */
                <div className={styles.albumGrid}>
                    {albums.map((album) => (
                        <div key={album.id} className={styles.albumCard} onClick={() => setSelectedAlbum(album)}>
                            <div className={styles.albumCoverWrapper}>
                                {album.cover ? (
                                    <img src={getStorageUrl(album.cover)} alt={album.title} className={styles.albumCover} />
                                ) : (
                                    <div className={styles.albumPlaceholder}>💿</div>
                                )}
                                <div className={styles.playOverlay}>
                                    <button
                                        className={styles.playAlbumBtn}
                                        onClick={(e) => { e.stopPropagation(); handlePlayAlbum(album); }}
                                    >
                                        <FiPlay />
                                    </button>
                                    <button
                                        className={styles.boostAlbumBtn}
                                        onClick={(e) => handleBoost(album, 'album', e)}
                                        title="Impulsionar Álbum"
                                        style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: '#ff0055', border: 'none', borderRadius: '50%',
                                            width: '35px', height: '35px', color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <FiTrendingUp />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.albumInfo}>
                                <h3 className={styles.albumTitle}>{album.title}</h3>
                                <p className={styles.albumArtist}>{user?.artisticName || "Você"}</p>
                                <span className={styles.albumMeta}>{album.Tracks?.length || 0} músicas • {album.genre}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Visão de Detalhes do Álbum (Lista de Músicas) */
                <div className={styles.albumDetails}>
                    <div className={styles.albumHeader}>
                        <div className={styles.bigCover}>
                            {selectedAlbum.cover ? (
                                <img src={getStorageUrl(selectedAlbum.cover)} alt={selectedAlbum.title} />
                            ) : (
                                <div className={styles.bigPlaceholder}>💿</div>
                            )}
                        </div>
                        <div className={styles.headerInfo}>
                            <span className={styles.label}>ÁLBUM {selectedAlbum.video && '• VIDEO COMPLETO DISPONÍVEL'}</span>
                            <h1 className={styles.bigTitle}>{selectedAlbum.title}</h1>
                            <div className={styles.metaRow}>
                                <span className={styles.artistName}>{user?.artisticName}</span>
                                <span>• {selectedAlbum.Tracks?.length || 0} músicas</span>
                                <span>• {selectedAlbum.genre}</span>
                            </div>
                            <div className={styles.actionButtons}>
                                <button className={styles.primaryBtn} onClick={() => handlePlayAlbum(selectedAlbum)}>
                                    <FiPlay /> Ouvir
                                </button>
                                <button className={styles.secondaryBtn} onClick={() => setEditingAlbum(selectedAlbum)} style={{ background: 'rgba(255,255,255,0.1)', marginLeft: '10px' }}>
                                    <FiEdit /> Editar Álbum
                                </button>
                            </div>
                            {selectedAlbum.description && <p style={{ marginTop: '10px', color: '#ccc' }}>{selectedAlbum.description}</p>}
                        </div>
                    </div>

                    <div className={styles.trackList}>
                        {selectedAlbum.Tracks?.map((track, idx) => (
                            <div key={track.id} className={styles.trackItem} onClick={() => handlePlayTrack(track)}>
                                <div className={styles.trackIndex}>{idx + 1}</div>
                                <div className={styles.trackInfo}>
                                    <div className={styles.details}>
                                        <span className={styles.trackTitle}>{track.title}</span>
                                    </div>
                                </div>
                                <div className={styles.trackActions}>
                                    <button className={styles.iconBtn} onClick={() => handlePlayTrack(track)} title="Ouvir">
                                        <FiPlay />
                                    </button>
                                    <button className={styles.iconBtn} onClick={() => handleDownload(track)} title="Baixar">
                                        <FiDownload />
                                    </button>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={(e) => handleBoost(track, 'track', e)}
                                        title="Impulsionar"
                                        style={{ color: '#ff0055' }}
                                    >
                                        <FiTrendingUp />
                                    </button>
                                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={(e) => handleDelete(track.id, e)} title="Excluir">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Upload */}
            {showUploadModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeModalBtn} onClick={() => setShowUploadModal(false)}>
                            <FiX />
                        </button>
                        <div style={{ padding: '20px' }}>
                            <Upload onSuccess={() => { setShowUploadModal(false); fetchAlbums(); }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Impulsionamento */}
            {showBoostModal && (
                <BoostModal
                    item={boostItem}
                    type={boostType}
                    onClose={() => setShowBoostModal(false)}
                    onSuccess={() => { }}
                />
            )}

            {/* Modal de Edição de Álbum */}
            {editingAlbum && (
                <EditAlbumModal
                    album={editingAlbum}
                    onClose={() => setEditingAlbum(null)}
                    onSuccess={fetchAlbums}
                />
            )}
        </div>
    );
};

export default MyUploads;
