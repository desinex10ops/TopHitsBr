import * as React from 'react';
const { useEffect, useState } = React;
import api from '../../services/api';
import styles from './Admin.module.css';
import { useToast } from '../../contexts/ToastContext';
import { FiSlash, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Modal state
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [creditAmount, setCreditAmount] = useState('');
    const [creditAction, setCreditAction] = useState('add'); // 'add' | 'set'

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/music/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            addToast('Erro ao carregar usuários.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (user) => {
        try {
            const res = await api.patch(`/music/admin/users/${user.id}/ban`);

            // Update local state
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, active: res.data.active } : u
            ));

            addToast(res.data.active ? 'Usuário ativado!' : 'Usuário banido!', 'success');
        } catch (error) {
            console.error('Erro ao banir/desbanir:', error);
            addToast('Erro ao alterar status.', 'error');
        }
    };

    const openCreditModal = (user) => {
        setSelectedUser(user);
        setCreditAmount('');
        setCreditAction('add');
        setShowCreditModal(true);
    };

    const handleUpdateCredits = async (e) => {
        e.preventDefault();
        if (!selectedUser || !creditAmount) return;

        try {
            const res = await api.post(`/music/admin/users/${selectedUser.id}/credits`, {
                amount: parseFloat(creditAmount),
                action: creditAction
            });

            // Update local state (credits in wallet)
            setUsers(users.map(u => {
                if (u.id === selectedUser.id) {
                    return { ...u, Wallet: { ...u.Wallet, balance: res.data.balance } };
                }
                return u;
            }));

            addToast('Créditos atualizados com sucesso!', 'success');
            setShowCreditModal(false);
        } catch (error) {
            console.error('Erro ao atualizar créditos:', error);
            addToast('Erro ao atualizar créditos.', 'error');
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h2>Gerenciar Usuários</h2>
            </div>

            {loading ? <p>Carregando...</p> : (
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Tipo</th>
                                <th>Créditos</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ opacity: user.active ? 1 : 0.5 }}>
                                    <td>
                                        {user.name}
                                        {user.artisticName && <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.artisticName}</div>}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span style={{
                                            backgroundColor: user.type === 'admin' ? '#e50914' : user.type === 'artist' ? '#1db954' : '#333',
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#fff'
                                        }}>
                                            {user.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        💰 {user.Wallet?.balance || 0}
                                    </td>
                                    <td>
                                        {user.active ?
                                            <span style={{ color: '#1db954' }}>Ativo</span> :
                                            <span style={{ color: '#e50914' }}>Banido</span>
                                        }
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => openCreditModal(user)}
                                                className={styles.actionBtn}
                                                style={{ backgroundColor: '#f59e0b' }}
                                                title="Gerenciar Créditos"
                                            >
                                                <FiDollarSign />
                                            </button>

                                            <button
                                                onClick={() => handleToggleBan(user)}
                                                className={styles.actionBtn}
                                                style={{ backgroundColor: user.active ? '#e50914' : '#1db954' }}
                                                title={user.active ? 'Banir' : 'Ativar'}
                                            >
                                                {user.active ? <FiSlash /> : <FiCheckCircle />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Créditos */}
            {showCreditModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '10px',
                        width: '400px', border: '1px solid #333'
                    }}>
                        <h3>Créditos: {selectedUser?.name}</h3>
                        <p>Saldo atual: {selectedUser?.Wallet?.balance || 0}</p>

                        <form onSubmit={handleUpdateCredits}>
                            <div style={{ margin: '20px 0', display: 'flex', gap: '20px' }}>
                                <label>
                                    <input
                                        type="radio"
                                        checked={creditAction === 'add'}
                                        onChange={() => setCreditAction('add')}
                                    /> Adicionar
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        checked={creditAction === 'set'}
                                        onChange={() => setCreditAction('set')}
                                    /> Definir (Set)
                                </label>
                            </div>

                            <input
                                type="number"
                                placeholder="Quantidade"
                                value={creditAmount}
                                onChange={e => setCreditAmount(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px', marginBottom: '20px',
                                    borderRadius: '5px', border: '1px solid #333',
                                    backgroundColor: '#222', color: '#fff'
                                }}
                                autoFocus
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreditModal(false)}
                                    style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#1db954', color: '#fff', cursor: 'pointer' }}
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
