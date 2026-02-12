import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './MyPurchases.module.css';
import { FiDownload, FiClock, FiShield } from 'react-icons/fi';

const MyPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await api.get('/shop/my-orders');
            // Backend returns: [{ id, createdAt, OrderItems: [{ Product: {...} }] }]
            // We need to map it to our UI structure if different, or adjust UI
            // UI expects: { id, date, items: [{ Product: ... }] }

            const formatted = res.data.map(order => ({
                id: order.id,
                date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
                items: order.OrderItems
            }));

            setPurchases(formatted);


        } catch (error) {
            console.error("Erro ao buscar compras:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (productId, orderId) => {
        try {
            const res = await api.post('/shop/delivery/link', { productId, orderId });
            const { downloadUrl, expiresAt } = res.data;

            // Trigger download
            // Note: In dev, the URL is relative to API. We need the full URL if on different port?
            // api.js handles base URL. 
            // We can just open the link in new tab.

            const fullLink = `${api.defaults.baseURL.replace('/api', '')}${downloadUrl}`;
            window.open(fullLink, '_blank');

            alert(`Link gerado! Válido até ${new Date(expiresAt).toLocaleString()}`);
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar link de download.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Meus Pedidos & Downloads</h1>

            {loading ? <p>Carregando...</p> : (
                <div className={styles.grid}>
                    {purchases.map(order => (
                        <div key={order.id} className={styles.card}>
                            <div className={styles.header}>
                                <span>Pedido #{order.id}</span>
                                <span className={styles.date}>{order.date}</span>
                            </div>

                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.productRow}>
                                    <div className={styles.productInfo}>
                                        <h3>{item.Product.title}</h3>
                                        <div className={styles.badges}>
                                            <span className={styles.badge}><FiShield /> Protegido</span>
                                            <span className={styles.badge}><FiClock /> 24h</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(item.Product.id, order.id)}
                                        className={styles.downloadBtn}
                                    >
                                        <FiDownload /> Baixar
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}

                    {purchases.length === 0 && (
                        <div className={styles.empty}>
                            <p>Você ainda não fez nenhuma compra.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
