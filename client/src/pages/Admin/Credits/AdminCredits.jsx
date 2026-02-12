import * as React from 'react';
const { useState, useEffect } = React;
import api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import styles from './AdminCredits.module.css';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiDollarSign, FiPackage, FiSettings } from 'react-icons/fi';

const AdminCredits = () => {
    const [packages, setPackages] = useState([]);
    const [settings, setSettings] = useState({
        cost_boost_track: 3,
        cost_boost_album: 8,
        cost_highlight: 5
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'settings'
    const { addToast } = useToast();

    // Package Form State
    const [showForm, setShowForm] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);
    const [formData, setFormData] = useState({ name: '', credits: 10, price: 9.90, description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pkgRes, setRes] = await Promise.all([
                api.get('/credits/admin/packages'),
                api.get('/credits/admin/settings')
            ]);
            setPackages(pkgRes.data);
            setSettings(setRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados admin:", error);
            // addToast("Erro ao carregar dados.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            // Need an endpoint to update settings. 
            // AdminController usually handles generic settings update.
            // Let's assume we use the existing generic settings endpoint or create a specific one.
            // musicRoutes.js has router.post('/admin/settings', ...);
            // adminCreditController has getGlobalSettings but not updateGlobalSettings yet?
            // Wait, adminController.js likely has updateSettings.
            // I will check adminController.js later but will assume /api/music/admin/settings works for key-value pairs.

            // Loop through settings and save each
            await Promise.all(Object.keys(settings).map(key =>
                api.post('/music/admin/settings', { key, value: settings[key].toString() })
            ));

            addToast("Configurações salvas!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao salvar configurações.", "error");
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
            setEditingPkg(null);
            setFormData({ name: '', credits: 10, price: 9.90, description: '' });
            fetchData();
        } catch (error) {
            console.error(error);
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
            console.error(error);
            addToast("Erro ao remover pacote.", "error");
        }
    };

    const openEdit = (pkg) => {
        setEditingPkg(pkg);
        setFormData({ name: pkg.name, credits: pkg.credits, price: pkg.price, description: pkg.description });
        setShowForm(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Gerenciamento de Créditos</h1>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'packages' ? styles.active : ''}`}
                        onClick={() => setActiveTab('packages')}
                    >
                        <FiPackage /> Pacotes
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <FiSettings /> Custos & Regras
                    </button>
                </div>
            </div>

            {loading ? <p>Carregando...</p> : (
                <div className={styles.content}>
                    {activeTab === 'packages' && (
                        <div>
                            <div className={styles.actionRow}>
                                <button className={styles.addBtn} onClick={() => { setEditingPkg(null); setFormData({ name: '', credits: 10, price: 9.90, description: '' }); setShowForm(true); }}>
                                    <FiPlus /> Novo Pacote
                                </button>
                            </div>

                            {showForm && (
                                <form className={styles.form} onSubmit={handleSavePackage}>
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
                                    <div className={styles.formGroup}>
                                        <label>Descrição</label>
                                        <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
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
                                            <button onClick={() => openEdit(pkg)}><FiEdit /></button>
                                            <button onClick={() => handleDeletePackage(pkg.id)} className={styles.deleteBtn}><FiTrash2 /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsContainer}>
                            <h3>Custo por Ação (Créditos)</h3>
                            <div className={styles.settingItem}>
                                <label>Impulsionar Track</label>
                                <input
                                    type="number"
                                    value={settings.cost_boost_track}
                                    onChange={e => setSettings({ ...settings, cost_boost_track: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className={styles.settingItem}>
                                <label>Impulsionar Álbum</label>
                                <input
                                    type="number"
                                    value={settings.cost_boost_album}
                                    onChange={e => setSettings({ ...settings, cost_boost_album: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className={styles.settingItem}>
                                <label>Destaque Premium</label>
                                <input
                                    type="number"
                                    value={settings.cost_highlight}
                                    onChange={e => setSettings({ ...settings, cost_highlight: parseInt(e.target.value) })}
                                />
                            </div>

                            <button className={styles.saveSettingsBtn} onClick={handleSaveSettings}>
                                <FiSave /> Salvar Configurações
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCredits;
