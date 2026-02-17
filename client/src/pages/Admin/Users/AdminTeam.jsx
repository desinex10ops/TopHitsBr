import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { FiUsers, FiShield, FiStar, FiFilter, FiMoreVertical, FiUserX, FiUserCheck, FiAtSign } from 'react-icons/fi';
import styles from './AdminTeam.module.css';
import { getStorageUrl } from '../../../utils/urlUtils';

const AdminTeam = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, admin, seller
    const { addToast } = useToast();

    useEffect(() => {
        fetchTeam();
    }, [filter]);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            // Fetch users with filters for staff roles
            const response = await api.get('/users', {
                params: {
                    limit: 50,
                    // We can add a custom staff filter if backend supports it, 
                    // or just filter on frontend for small-ish teams.
                    // For now, let's fetch and filter if backend isn't specific.
                }
            });

            let filteredMembers = response.data.users.filter(u =>
                u.type === 'admin' || u.isSeller === true
            );

            if (filter === 'admin') {
                filteredMembers = filteredMembers.filter(u => u.type === 'admin');
            } else if (filter === 'seller') {
                filteredMembers = filteredMembers.filter(u => u.isSeller);
            }

            setMembers(filteredMembers);
        } catch (error) {
            console.error('Erro ao buscar equipe:', error);
            addToast('Erro ao carregar membros da equipe.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = !user.active;
            await api.patch(`/users/${user.id}/status`, { active: newStatus });
            setMembers(members.map(m => m.id === user.id ? { ...m, active: newStatus } : m));
            addToast(`${user.name} foi ${newStatus ? 'ativado' : 'desativado'}.`, 'success');
        } catch (error) {
            addToast('Erro ao atualizar status.', 'error');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h1>Gestão de Equipe</h1>
                    <p>Gerencie Administradores e Vendedores da plataforma</p>
                </div>

                <div className={styles.controls}>
                    <div className={styles.filterGroup}>
                        <button
                            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'admin' ? styles.active : ''}`}
                            onClick={() => setFilter('admin')}
                        >
                            Admins
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'seller' ? styles.active : ''}`}
                            onClick={() => setFilter('seller')}
                        >
                            Vendedores
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.teamGrid}>
                {loading ? (
                    <div className={styles.loading}>Carregando equipe...</div>
                ) : members.length > 0 ? (
                    members.map(member => (
                        <div key={member.id} className={`${styles.card} ${!member.active ? styles.inactive : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.roleTag}>
                                    {member.type === 'admin' ? (
                                        <span className={styles.adminTag}><FiShield /> Admin</span>
                                    ) : (
                                        <span className={styles.sellerTag}><FiStar /> Vendedor</span>
                                    )}
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        onClick={() => handleToggleStatus(member)}
                                        className={member.active ? styles.banAction : styles.unbanAction}
                                        title={member.active ? 'Desativar Acesso' : 'Ativar Acesso'}
                                    >
                                        {member.active ? <FiUserX /> : <FiUserCheck />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    <img
                                        src={member.avatar ? getStorageUrl(member.avatar) : '/default-avatar.png'}
                                        alt={member.name}
                                        className={styles.avatar}
                                    />
                                    <div className={`${styles.statusDot} ${member.active ? styles.online : styles.offline}`}></div>
                                </div>
                                <h2>{member.name}</h2>
                                {member.artisticName && <p className={styles.artisticName}>{member.artisticName}</p>}
                                <p className={styles.email}><FiAtSign /> {member.email}</p>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.statItem}>
                                    <span>Vendas/Ativ.</span>
                                    <strong>{member.stats?.sales || 0}</strong>
                                </div>
                                <div className={styles.statItem}>
                                    <span>Participação</span>
                                    <strong>{new Date(member.createdAt).toLocaleDateString()}</strong>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <FiUsers size={48} />
                        <p>Nenhum membro da equipe encontrado com este filtro.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTeam;
