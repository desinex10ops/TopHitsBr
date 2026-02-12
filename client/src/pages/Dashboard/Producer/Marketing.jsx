import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './Marketing.module.css';
import { FiTag, FiTrash2, FiPlus } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';

const Marketing = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { addToast } = useToast();

    // Form Stats
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [limit, setLimit] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/marketing/coupons');
            setCoupons(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/marketing/coupons', {
                code,
                discountPercentage: parseInt(discount),
                usageLimit: limit ? parseInt(limit) : -1
            });
            addToast('Cupom criado!', 'success');
            setShowModal(false);
            setCode('');
            setDiscount('');
            setLimit('');
            fetchCoupons();
        } catch (error) {
            console.error(error);
            addToast('Erro ao criar cupom.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este cupom?')) return;
        try {
            await api.delete(`/marketing/coupons/${id}`);
            addToast('Cupom excluído.', 'success');
            fetchCoupons();
        } catch (error) {
            addToast('Erro ao excluir.', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Carregando marketing...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Marketing & Promoções</h1>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <FiPlus /> Novo Cupom
                </button>
            </div>

            <div className={styles.couponGrid}>
                {coupons.map(coupon => (
                    <div key={coupon.id} className={styles.couponCard}>
                        <div className={styles.couponHeader}>
                            <FiTag className={styles.icon} />
                            <span className={styles.code}>{coupon.code}</span>
                        </div>
                        <div className={styles.couponDetails}>
                            <div className={styles.detail}>
                                <span>Desconto</span>
                                <strong>{coupon.discountPercentage}%</strong>
                            </div>
                            <div className={styles.detail}>
                                <span>Usos</span>
                                <strong>{coupon.usedCount} / {coupon.usageLimit === -1 ? '∞' : coupon.usageLimit}</strong>
                            </div>
                        </div>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(coupon.id)}>
                            <FiTrash2 /> Excluir
                        </button>
                    </div>
                ))}

                {coupons.length === 0 && <p className={styles.empty}>Nenhum cupom ativo.</p>}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Novo Cupom de Desconto</h2>
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                placeholder="Código (ex: VERAO20)"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Porcentagem de Desconto (%)"
                                value={discount}
                                onChange={e => setDiscount(e.target.value)}
                                min="1" max="100"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Limite de Usos (opcional)"
                                value={limit}
                                onChange={e => setLimit(e.target.value)}
                            />
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className={styles.confirmBtn}>Criar Cupom</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketing;
