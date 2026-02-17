import { useState, useEffect } from 'react';
import { FiMessageSquare, FiTrash, FiExternalLink } from 'react-icons/fi';
import styles from './Dashboard.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DashboardComments = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const res = await api.get('/comments/user');
            setComments(res.data);
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Excluir este comentário?")) {
            try {
                await api.delete(`/comments/${id}`);
                setComments(comments.filter(c => c.id !== id));
            } catch (error) {
                console.error("Erro ao excluir comentário:", error);
                alert("Erro ao excluir comentário.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Meus Comentários</h2>
                    <p className={styles.subtitle}>Gerencie suas interações</p>
                </div>
            </div>

            <div className={styles.commentsList}>
                {loading ? (
                    <p>Carregando...</p>
                ) : comments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FiMessageSquare size={40} />
                        <p>Você ainda não fez nenhum comentário.</p>
                    </div>
                ) : (
                    comments.map(comment => {
                        const targetName = comment.Track?.title || comment.Playlist?.name || 'Item Desconhecido';
                        const targetType = comment.Track ? 'Música' : (comment.Playlist ? 'Playlist' : 'Item');
                        const targetLink = comment.Track ? `/playlist/random` : `/playlist/${comment.PlaylistId}`;
                        // Track link is tricky if we don't know context, but usually we play it. 
                        // For now let's link to playlist if playlist, or just generic if track (maybe artist page?)

                        return (
                            <div key={comment.id} className={styles.commentItem}>
                                <div className={styles.commentContent}>
                                    <p className={styles.commentText}>"{comment.content}"</p>
                                    <div className={styles.commentMeta}>
                                        <span>Em {targetType}: <strong>{targetName}</strong></span>
                                        <span>• {new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={styles.commentActions}>
                                    <button
                                        className={styles.actionBtn}
                                        title="Excluir"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        <FiTrash />
                                    </button>
                                    <Link
                                        to={targetLink}
                                        className={styles.actionBtn}
                                        title={`Ver ${targetType}`}
                                    >
                                        <FiExternalLink />
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default DashboardComments;
