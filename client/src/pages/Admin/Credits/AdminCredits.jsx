import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import styles from './AdminCredits.module.css';
import {
    FiPlus, FiEdit, FiTrash2, FiSave, FiPackage, FiSettings,
    FiCheck, FiX, FiActivity, FiArrowUpRight, FiTrendingUp
} from 'react-icons/fi';

const AdminCredits = () => {
    const [packages, setPackages] = useState([]);
    const [settings, setSettings] = useState({
        cost_boost_track: 3,
        cost_boost_album: 8,
        cost_highlight: 5
    });
    const [withdrawals, setWithdrawals] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'settings' | 'withdrawals' | 'finance'
    const { addToast } = useToast();

    // Package Form State
    const [showForm, setShowForm] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);
    const [formData, setFormData] = useState({ name: '', credits: 10, price: 9.90, description: '' });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'packages' || activeTab === 'settings') {
                const [pkgRes, setRes] = await Promise.all([
                    api.get('/credits/admin/packages'),
                    api.get('/credits/admin/settings')
                ]);
                setPackages(pkgRes.data);
                setSettings(setRes.data);
            } else if (activeTab === 'withdrawals') {
                const res = await api.get('/finance/admin/withdrawals');
                setWithdrawals(res.data.withdrawals);
            } else if (activeTab === 'finance') {
                const res = await api.get('/finance/admin/summary');
                setSummary(res.data);
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            addToast("Erro ao carregar dados.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await Promise.all(Object.keys(settings).map(key =>
                api.post('/music/admin/settings', { key, value: settings[key].toString() })
            ));
            addToast("Configurações salvas!", "success");
        } catch (error) {
            addToast("Erro ao salvar configurações.", "error");
        }
    };

    const handleManageWithdrawal = async (id, status) => {
        const remarks = status === 'rejected' ? window.prompt("Motivo da rejeição:") : "";
        if (status === 'rejected' && remarks === null) return;

        try {
            await api.patch(`/finance/admin/withdrawals/${id}`, { status, remarks });
            addToast(`Saque ${status === 'paid' ? 'aprovado' : 'rejeitado'}!`, "success");
            fetchData();
        } catch (error) {
            addToast("Erro ao processar saque.", "error");
        }
    };

    const handleSavePackage = async (e) => {
        e.preventDefault();
        try {
            if (editingPkg) {
                await api.put(`/credits/admin/packages/${editingPkg.id}`, formData);
                addToast("Pacote atualizado!", "success");
            } else {
                await api.post('/credits/admin/packages', formData);
                addToast("Pacote criado!", "success");
            }
            setShowForm(false);
            fetchData();
        } catch (error) {
            addToast("Erro ao salvar pacote.", "error");
        }
    };

    const handleDeletePackage = async (id) => {
        if (!window.confirm("Remover este pacote?")) return;
        try {
            await api.delete(`/credits/admin/packages/${id}`);
            addToast("Pacote removido!", "success");
            fetchData();
        } catch (error) {
            addToast("Erro ao remover pacote.", "error");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Gestão de Créditos & Financeiro</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'packages' ? styles.active : ''}`} onClick={() => setActiveTab('packages')}>
                        <FiPackage /> Pacotes
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
                        <FiSettings /> Custos
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'withdrawals' ? styles.active : ''}`} onClick={() => setActiveTab('withdrawals')}>
                        <FiArrowUpRight /> Saques
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'finance' ? styles.active : ''}`} onClick={() => setActiveTab('finance')}>
                        <FiTrendingUp /> Financeiro
                    </button>
                </div>
            </div>

            {loading ? <p className={styles.loading}>Carregando...</p> : (
                <div className={styles.content}>
                    {activeTab === 'packages' && (
                        <div>
                            <div className={styles.actionRow}>
                                <button className={styles.addBtn} onClick={() => { setEditingPkg(null); setFormData({ name: '', credits: 10, price: 9.90, description: '' }); setShowForm(true); }}>
                                    <FiPlus /> Novo Pacote
                                </button>
                            </div>
                            {showForm && (
                                <form className={styles.form} onClick={e => e.stopPropagation()} onSubmit={handleSavePackage}>
                                    <h3>{editingPkg ? 'Editar Pacote' : 'Novo Pacote'}</h3>
                                    <div className={styles.formGroup}>
                                        <label>Nome</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>Créditos</label>
                                            <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Preço (R$)</label>
                                            <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
                                        </div>
                                    </div>
                                    <div className={styles.formActions}>
                                        <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                                        <button type="submit" className={styles.saveBtn}>Salvar</button>
                                    </div>
                                </form>
                            )}
                            <div className={styles.grid}>
                                {packages.map(pkg => (
                                    <div key={pkg.id} className={styles.card}>
                                        <div className={styles.cardHeader}>
                                            <h3>{pkg.name}</h3>
                                            <span className={styles.credits}>{pkg.credits} CR</span>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <span className={styles.price}>R$ {pkg.price.toFixed(2)}</span>
                                            <p>{pkg.description}</p>
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <button onClick={() => { setEditingPkg(pkg); setFormData(pkg); setShowForm(true); }}><FiEdit /></button>
                                            <button onClick={() => handleDeletePackage(pkg.id)} className={styles.deleteBtn}><FiTrash2 /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsContainer}>
                            <h3>Custos em Créditos</h3>
                            {Object.keys(settings).map(key => (
                                <div key={key} className={styles.settingItem}>
                                    <label>{key.replace(/_/g, ' ').replace('cost', 'Custo')}</label>
                                    <input type="number" value={settings[key]} onChange={e => setSettings({ ...settings, [key]: parseInt(e.target.value) })} />
                                </div>
                            ))}
                            <button className={styles.saveSettingsBtn} onClick={handleSaveSettings}><FiSave /> Salvar</button>
                        </div>
                    )}

                    {activeTab === 'withdrawals' && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Usuário</th>
                                        <th>Valor</th>
                                        <th>PIX</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawals.map(w => (
                                        <tr key={w.id}>
                                            <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                                            <td>{w.User?.name || 'Sistema'}</td>
                                            <td>R$ {parseFloat(w.amount).toFixed(2)}</td>
                                            <td>{w.pixKeyType.toUpperCase()}: {w.pixKey}</td>
                                            <td><span className={`${styles.statusBadge} ${styles[w.status]}`}>{w.status}</span></td>
                                            <td className={styles.actionButtons}>
                                                {w.status === 'pending' && (
                                                    <>
                                                        <button className={styles.approveBtn} onClick={() => handleManageWithdrawal(w.id, 'paid')}><FiCheck /> Pagar</button>
                                                        <button className={styles.rejectBtn} onClick={() => handleManageWithdrawal(w.id, 'rejected')}><FiX /> Recusar</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {withdrawals.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Nenhum pedido encontrado.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'finance' && summary && (
                        <div>
                            <div className={styles.summaryCards}>
                                <div className={styles.summaryCard}>
                                    <h4>Vendas Totais</h4>
                                    <span className={styles.value}>R$ {summary.summary.totalSales.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryCard}>
                                    <h4>Comissão Estimada (10%)</h4>
                                    <span className={styles.value} style={{ color: '#1db954' }}>R$ {summary.summary.platformEarnings.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryCard}>
                                    <h4>Saques Pendentes</h4>
                                    <span className={styles.value} style={{ color: '#ffc107' }}>R$ {summary.summary.pendingWithdrawals.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryCard}>
                                    <h4>Saques Pagos</h4>
                                    <span className={styles.value}>R$ {summary.summary.totalPaidWithdrawals.toFixed(2)}</span>
                                </div>
                            </div>
                            <h3>Vendas Recentes</h3>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Vendedor</th>
                                            <th>Comprador</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.recentSales.map(t => (
                                            <tr key={t.id}>
                                                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                                                <td>{t.Payee?.name || 'Sistema'}</td>
                                                <td>{t.Payer?.name || 'Comprador'}</td>
                                                <td>R$ {parseFloat(t.amount).toFixed(2)}</td>
                                                <td><span className={`${styles.statusBadge} ${styles.paid}`}>Concluído</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCredits;
