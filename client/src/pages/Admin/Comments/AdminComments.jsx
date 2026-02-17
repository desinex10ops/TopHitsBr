import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { FiSearch, FiMessageSquare, FiTrash2, FiSlash, FiCheckCircle } from 'react-icons/fi';
import styles from './AdminComments.module.css';
import { getStorageUrl } from '../../../utils/urlUtils';

const AdminComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/comments/admin/all');
            setComments(response.data);
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            addToast('Erro ao carregar comentários.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApprove = async (id) => {
        try {
            const res = await api.patch(`/comments/admin/approve/${id}`);
            setComments(comments.map(c => c.id === id ? { ...c, approved: res.data.approved } : c));
            addToast(`Comentário ${res.data.approved ? 'aprovado' : 'ocultado'}!`, 'success');
        } catch (error) {
            addToast('Erro ao atualizar comentário.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir permanentemente este comentário?')) return;
        try {
            await api.delete(`/comments/admin/${id}`);
            setComments(comments.filter(c => c.id !== id));
            addToast('Comentário excluído!', 'success');
        } catch (error) {
            addToast('Erro ao excluir comentário.', 'error');
        }
    };

    const filteredComments = comments.filter(c =>
        c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.User?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.Track?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Moderação de Comentários</h2>
                <div className={styles.searchBox}>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Buscar por conteúdo, autor ou música..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Carregando comentários...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Autor</th>
                                <th>Comentário</th>
                                <th>Alvo (Música/Playlist)</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComments.length > 0 ? filteredComments.map(comment => (
                                <tr key={comment.id}>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <img
                                                src={comment.User?.avatar ? getStorageUrl(comment.User.avatar) : '/default-avatar.png'}
                                                alt={comment.User?.name}
                                                className={styles.avatar}
                                            />
                                            <div>
                                                <span className={styles.userName}>{comment.User?.name}</span>
                                                <span className={styles.userEmail}>{comment.User?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.contentCell}>
                                        <div className={styles.commentText}>{comment.content}</div>
                                    </td>
                                    <td>
                                        <div className={styles.targetInfo}>
                                            {comment.Track ? (
                                                <>
                                                    <span className={styles.targetType}>Música:</span>
                                                    <span className={styles.targetName}>{comment.Track.title}</span>
                                                </>
                                            ) : comment.Playlist ? (
                                                <>
                                                    <span className={styles.targetType}>Playlist:</span>
                                                    <span className={styles.targetName}>{comment.Playlist.name}</span>
                                                </>
                                            ) : (
                                                <span className={styles.targetName}>-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {comment.approved ? (
                                            <span className={styles.statusActive}>
                                                <FiCheckCircle /> Visível
                                            </span>
                                        ) : (
                                            <span className={styles.statusBanned}>
                                                <FiSlash /> Oculto
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.btnIcon} ${comment.approved ? styles.btnUnapprove : styles.btnApprove}`}
                                                title={comment.approved ? "Ocultar" : "Aprovar"}
                                                onClick={() => handleToggleApprove(comment.id)}
                                            >
                                                {comment.approved ? <FiSlash /> : <FiCheckCircle />}
                                            </button>
                                            <button
                                                className={`${styles.btnIcon} ${styles.btnDelete}`}
                                                title="Excluir"
                                                onClick={() => handleDelete(comment.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                        Nenhum comentário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminComments;
