import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import styles from './CommentsSection.module.css';
import { FiTrash2 } from 'react-icons/fi';
import { getStorageUrl } from '../../utils/urlUtils';

const CommentsSection = ({ targetId, targetType = 'track' }) => {
    const { user, isAuthenticated } = useAuth();
    const { addToast } = useToast();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (targetId) {
            fetchComments();
        }
    }, [targetId, targetType]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (targetType === 'playlist') endpoint = `/comments/playlist/${targetId}`;
            else if (targetType === 'album') endpoint = `/comments/album/${targetId}`;
            else endpoint = `/comments/track/${targetId}`;

            const res = await api.get(endpoint);
            setComments(res.data);
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!isAuthenticated) {
            return addToast('Faça login para comentar.', 'info');
        }

        setSubmitting(true);
        try {
            const payload = {
                content: newComment,
                trackId: targetType === 'track' ? targetId : null,
                playlistId: targetType === 'playlist' ? targetId : null,
                albumId: targetType === 'album' ? targetId : null
            };

            const res = await api.post('/comments', payload);

            // Add to list immediately (optimistic update or using response)
            setComments([res.data, ...comments]);
            setNewComment('');
            addToast('Comentário enviado!', 'success');
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            addToast('Erro ao enviar comentário.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Excluir comentário?")) return;

        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
            addToast('Comentário excluído.', 'success');
        } catch (error) {
            console.error("Erro ao excluir:", error);
            addToast('Erro ao excluir comentário.', 'error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Comentários ({comments.length})</h3>

            {/* Comment Form */}
            <div className={styles.commentForm}>
                <img
                    src={user?.avatar ? getStorageUrl(user.avatar) : '/default-avatar.png'}
                    alt="User"
                    className={styles.avatar}
                />
                <div className={styles.inputWrapper}>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            className={styles.input}
                            placeholder={isAuthenticated ? "Adicione um comentário..." : "Faça login para comentar"}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!isAuthenticated || submitting}
                        />
                        {isAuthenticated && (
                            <button type="submit" className={styles.submitBtn} disabled={!newComment.trim() || submitting}>
                                {submitting ? 'Enviando...' : 'Comentar'}
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Comments List */}
            <div className={styles.commentList}>
                {loading ? <p>Carregando comentários...</p> : comments.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Seja o primeiro a comentar!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={styles.commentItem}>
                            <img
                                src={comment.User?.avatar ? getStorageUrl(comment.User.avatar) : '/default-avatar.png'}
                                alt={comment.User?.name}
                                className={styles.avatar}
                            />
                            <div className={styles.commentContent}>
                                <div className={styles.header}>
                                    <span className={styles.userName}>{comment.User?.name || 'Usuário'}</span>
                                    <span className={styles.time}>{formatDate(comment.createdAt)}</span>
                                    {(user?.id === comment.UserId || user?.type === 'admin') && (
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(comment.id)}>
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                                <p className={styles.text}>{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
