import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { FiPlus, FiTrash2, FiTag, FiCalendar, FiUsers, FiCheck } from 'react-icons/fi';
import styles from './AdminMarketing.module.css';

const AdminMarketing = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const { addToast } = useToast();

    // New Coupon State
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountPercentage: 10,
        validUntil: '',
        usageLimit: -1
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get('/marketing/admin/coupons');
            setCoupons(res.data);
        } catch (error) {
            addToast('Erro ao carregar cupons.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/marketing/admin/coupons', newCoupon);
            setCoupons([res.data, ...coupons]);
            setShowCreate(false);
            setNewCoupon({ code: '', discountPercentage: 10, validUntil: '', usageLimit: -1 });
            addToast('Cupom global criado!', 'success');
        } catch (error) {
            addToast('Erro ao criar cupom.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este cupom?')) return;
        try {
            await api.delete(`/marketing/admin/coupons/${id}`);
            setCoupons(coupons.filter(c => c.id !== id));
            addToast('Cupom excluído!', 'success');
        } catch (error) {
            addToast('Erro ao excluir cupom.', 'error');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Marketing & Promoções</h2>
                    <p>Gerencie cupons de desconto globais para o Marketplace.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
                    <FiPlus /> Novo Cupom Global
                </button>
            </div>

            {showCreate && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Criar Cupom Global</h3>
                        <form onSubmit={handleCreate}>
                            <div className={styles.formGroup}>
                                <label>Código do Cupom</label>
                                <input
                                    type="text"
                                    placeholder="EX: TOP2026"
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Desconto (%)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newCoupon.discountPercentage}
                                        onChange={e => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Limite de Uso (-1 = Infinito)</label>
                                    <input
                                        type="number"
                                        min="-1"
                                        value={newCoupon.usageLimit}
                                        onChange={e => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Válido Até (Deixe vazio para ilimitado)</label>
                                <input
                                    type="date"
                                    value={newCoupon.validUntil}
                                    onChange={e => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancelar</button>
                                <button type="submit" className={styles.saveBtn}>Salvar Cupom</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Carregando...</div>
            ) : (
                <div className={styles.couponGrid}>
                    {coupons.map(coupon => (
                        <div key={coupon.id} className={styles.couponCard}>
                            <div className={styles.couponHeader}>
                                <FiTag className={styles.tagIcon} />
                                <span className={styles.code}>{coupon.code}</span>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(coupon.id)}>
                                    <FiTrash2 />
                                </button>
                            </div>
                            <div className={styles.discount}>
                                {coupon.discountPercentage}% OFF
                            </div>
                            <div className={styles.details}>
                                <div className={styles.detailItem}>
                                    <FiUsers />
                                    <span>{coupon.usageLimit === -1 ? 'Sem limite' : `${coupon.usedCount}/${coupon.usageLimit}`} usos</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <FiCalendar />
                                    <span>{coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Sem Expiração'}</span>
                                </div>
                            </div>
                            <div className={styles.status}>
                                <span className={styles.badgeActive}>Ativo</span>
                                <span className={styles.typeLabel}>Global</span>
                            </div>
                        </div>
                    ))}
                    {coupons.length === 0 && (
                        <div className={styles.empty}>Nenhum cupom global cadastrado.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminMarketing;
