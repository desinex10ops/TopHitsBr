import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import styles from './MarketingSettings.module.css';
import { FiTag, FiTrash2, FiPlus, FiActivity, FiSave } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

const MarketingSettings = () => {
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

    const [metaPixel, setMetaPixel] = useState('');
    const [tiktokPixel, setTiktokPixel] = useState('');
    const [googleAnalytics, setGoogleAnalytics] = useState('');

    useEffect(() => {
        fetchCoupons();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/marketing/settings');
            if (res.data) {
                setMetaPixel(res.data.metaPixel || '');
                setTiktokPixel(res.data.tiktokPixel || '');
                setGoogleAnalytics(res.data.googleAnalytics || '');
            }
        } catch (error) {
            console.error("Erro ao carregar settings:", error);
        }
    };

    const handleSavePixel = async (type, value) => {
        try {
            await api.post('/marketing/settings', { [type]: value });
            addToast('Configuração salva com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao salvar configuração.', 'error');
        }
    };

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

    if (loading) return <div className={styles.loading}>Carregando configurações...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Cupons de Desconto</h2>
                    <p className={styles.sectionSubtitle}>Gerencie códigos promocionais para seus produtos.</p>
                </div>
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

            <div className={styles.divider} />

            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Pixels de Rastreamento (Tracking)</h2>
                    <p className={styles.sectionSubtitle}>Configure integrações para rastrear conversões.</p>
                </div>
            </div>

            <div className={styles.pixelGrid}>
                <div className={styles.pixelCard}>
                    <div className={styles.pixelHeader}>
                        <div className={styles.pixelIcon} style={{ color: '#1877F2' }}>
                            <FiActivity />
                        </div>
                        <h3>Meta Pixel (Facebook)</h3>
                    </div>
                    <p className={styles.pixelDesc}>Rastreie visualizações e compras vindo do Facebook e Instagram Ads.</p>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="ID do Pixel (ex: 1234567890)"
                            className={styles.pixelInput}
                            value={metaPixel}
                            onChange={(e) => setMetaPixel(e.target.value)}
                        />
                        <button className={styles.savePixelBtn} onClick={() => handleSavePixel('metaPixel', metaPixel)}><FiSave /></button>
                    </div>
                </div>

                <div className={styles.pixelCard}>
                    <div className={styles.pixelHeader}>
                        <div className={styles.pixelIcon} style={{ color: '#000000', backgroundColor: '#fff', borderRadius: '50%', padding: '4px' }}>
                            <FiActivity />
                        </div>
                        <h3>TikTok Pixel</h3>
                    </div>
                    <p className={styles.pixelDesc}>Otimize suas campanhas no TikTok Ads rastreando eventos.</p>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="ID do Pixel (ex: C123456789)"
                            className={styles.pixelInput}
                            value={tiktokPixel}
                            onChange={(e) => setTiktokPixel(e.target.value)}
                        />
                        <button className={styles.savePixelBtn} onClick={() => handleSavePixel('tiktokPixel', tiktokPixel)}><FiSave /></button>
                    </div>
                </div>

                <div className={styles.pixelCard}>
                    <div className={styles.pixelHeader}>
                        <div className={styles.pixelIcon} style={{ color: '#F4B400' }}>
                            <FiActivity />
                        </div>
                        <h3>Google Analytics 4</h3>
                    </div>
                    <p className={styles.pixelDesc}>Acompanhe o tráfego detalhado da sua loja.</p>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="ID de Medida (ex: G-XXXXXXXX)"
                            className={styles.pixelInput}
                            value={googleAnalytics}
                            onChange={(e) => setGoogleAnalytics(e.target.value)}
                        />
                        <button className={styles.savePixelBtn} onClick={() => handleSavePixel('googleAnalytics', googleAnalytics)}><FiSave /></button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Novo Cupom</h2>
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                placeholder="Código (ex: VERAO20)"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                required
                                className={styles.modalInput}
                            />
                            <input
                                type="number"
                                placeholder="Desconto (%)"
                                value={discount}
                                onChange={e => setDiscount(e.target.value)}
                                min="1" max="100"
                                required
                                className={styles.modalInput}
                            />
                            <input
                                type="number"
                                placeholder="Limite de Usos (opcional)"
                                value={limit}
                                onChange={e => setLimit(e.target.value)}
                                className={styles.modalInput}
                            />
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancelar</button>
                                <button type="submit" className={styles.confirmBtn}>Criar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingSettings;
