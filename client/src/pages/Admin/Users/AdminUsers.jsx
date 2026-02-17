import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { FiSearch, FiShield, FiUser, FiSlash, FiCheckCircle, FiEdit3, FiDownload } from 'react-icons/fi';
import styles from './AdminUsers.module.css';
import { getStorageUrl } from '../../../utils/urlUtils';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { addToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users', {
                params: {
                    page,
                    limit: 10,
                    search: searchTerm
                }
            });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            // addToast('Erro ao carregar usuários.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.patch(`/users/${userId}/role`, { type: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, type: newRole } : u));
            addToast('Função atualizada com sucesso!', 'success');
        } catch (error) {
            addToast('Erro ao atualizar função.', 'error');
        }
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            await api.patch(`/users/${userId}/status`, { active: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, active: newStatus } : u));
            addToast(`Usuário ${newStatus ? 'ativado' : 'banido'}!`, 'success');
        } catch (error) {
            addToast('Erro ao atualizar status.', 'error');
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return styles.badgeAdmin;
            case 'producer': return styles.badgeProducer;
            case 'artist': return styles.badgeArtist;
            default: return styles.badgeListener;
        }
    };

    const handleExportCSV = () => {
        window.open(`${api.defaults.baseURL}/users/export`, '_blank');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Gerenciar Usuários</h2>
                    <button className={styles.exportBtn} onClick={handleExportCSV}>
                        <FiDownload /> Exportar CSV
                    </button>
                </div>
                <div className={styles.searchBox}>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {loading && page === 1 ? (
                <div className={styles.loading}>Carregando usuários...</div>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>Função</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <img
                                                    src={user.avatar ? getStorageUrl(user.avatar) : '/default-avatar.png'}
                                                    alt={user.name}
                                                    className={styles.avatar}
                                                />
                                                <div>
                                                    <span className={styles.userName}>{user.name} {user.artisticName && `(${user.artisticName})`}</span>
                                                    <span className={styles.userEmail}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${getRoleBadgeClass(user.type)}`}>
                                                {user.type}
                                            </span>
                                        </td>
                                        <td>
                                            {user.active !== false ? (
                                                <span className={styles.statusActive}>
                                                    <FiCheckCircle /> Ativo
                                                </span>
                                            ) : (
                                                <span className={styles.statusBanned}>
                                                    <FiSlash /> Banido
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.btnIcon}
                                                    title="Mudar Função"
                                                    onClick={() => {
                                                        const roles = ['listener', 'artist', 'producer', 'admin'];
                                                        const currentIdx = roles.indexOf(user.type);
                                                        const nextRole = roles[(currentIdx + 1) % roles.length];
                                                        if (window.confirm(`Mudar ${user.name} para ${nextRole}?`)) {
                                                            handleUpdateRole(user.id, nextRole);
                                                        }
                                                    }}
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                {user.active !== false ? (
                                                    <button
                                                        className={`${styles.btnIcon} ${styles.btnBan}`}
                                                        title="Banir Usuário"
                                                        onClick={() => {
                                                            if (window.confirm(`Tem certeza que deseja BANIR ${user.name}?`)) {
                                                                handleUpdateStatus(user.id, false);
                                                            }
                                                        }}
                                                    >
                                                        <FiSlash />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={styles.btnIcon}
                                                        title="Ativar Usuário"
                                                        onClick={() => handleUpdateStatus(user.id, true)}
                                                    >
                                                        <FiCheckCircle />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageBtn}
                                disabled={page === 1}
                                onClick={() => setPage(prev => prev - 1)}
                            >
                                Anterior
                            </button>
                            <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
                            <button
                                className={styles.pageBtn}
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminUsers;
