import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './MyPurchases.module.css';
import { FiDownload, FiClock, FiShield, FiPlay, FiExternalLink, FiPackage } from 'react-icons/fi';
import { getStorageUrl } from '@/utils/urlUtils';
import { useToast } from '@/contexts/ToastContext';
import { usePlayer } from '@/contexts/PlayerContext';

import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

const MyPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const { playTrack } = usePlayer();
    const { clearCart } = useCart(); // [NEW]
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            // Check for success param from Mercado Pago Redirect
            const params = new URLSearchParams(location.search);
            const status = params.get('status');
            const paymentId = params.get('payment_id');
            const orderId = params.get('external_reference');

            if (status === 'approved' || status === 'success') {
                try {
                    // Manual verification for Localhost (Webhook won't reach us)
                    if (paymentId && orderId) {
                        await api.post('/payment/confirm-manual', { paymentId, orderId, status: 'approved' });
                    }

                    addToast('Pagamento confirmado! Sua coleção foi atualizada.', 'success');
                    if (clearCart) clearCart();

                    // Refresh list
                    fetchPurchases();

                } catch (error) {
                    console.error("Erro na verificação manual:", error);
                    // Even if manual check fails, maybe webhook worked?
                } finally {
                    // Remove params from URL
                    navigate('/dashboard/purchases', { replace: true });
                }
            } else if (status === 'failure') {
                addToast('O pagamento falhou ou foi cancelado.', 'error');
                navigate('/dashboard/purchases', { replace: true });
            } else {
                fetchPurchases();
            }
        };

        verifyPayment();
    }, [location]);

    const fetchPurchases = async () => {
        try {
            const res = await api.get('/shop/my-orders');
            // Backend returns: [{ id, createdAt, OrderItems: [{ Product: {...} }] }]

            // For a "Collection" view, we want to flatten the products
            const allProducts = [];
            res.data.forEach(order => {
                order.OrderItems.forEach(item => {
                    allProducts.push({
                        ...item.Product,
                        orderId: order.id,
                        purchaseDate: new Date(order.createdAt).toLocaleDateString('pt-BR'),
                        orderStatus: order.status
                    });
                });
            });

            setPurchases(allProducts);
        } catch (error) {
            console.error("Erro ao buscar compras:", error);
            addToast("Erro ao carregar sua coleção.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (productId, orderId) => {
        try {
            addToast("Gerando link de download...", "info");
            const res = await api.post('/shop/delivery/link', { productId, orderId });
            const { downloadUrl } = res.data;

            const fullLink = `${api.defaults.baseURL.replace('/api', '')}${downloadUrl}`;
            window.open(fullLink, '_blank');
        } catch (error) {
            console.error(error);
            addToast('Erro ao gerar link de download. Tente novamente mais tarde.', 'error');
        }
    };

    const handlePlayPreview = (product) => {
        if (!product.previewPath) return addToast('Sem preview disponível.', 'info');

        playTrack({
            id: `purchased-${product.id}`,
            title: product.title,
            artist: product.Producer?.artisticName || 'TopHits Artist',
            coverpath: product.coverPath,
            filepath: product.previewPath,
            isPreview: true
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Minha Coleção Digital</h1>

            {loading ? (
                <div className={styles.empty}>Carregando sua coleção...</div>
            ) : (
                <div className={styles.grid}>
                    {purchases.map((product, idx) => (
                        <div key={`${product.orderId}-${product.id}-${idx}`} className={styles.card}>
                            <div className={styles.coverContainer}>
                                <img
                                    src={getStorageUrl(product.coverPath)}
                                    alt={product.title}
                                    className={styles.cover}
                                    onError={(e) => { e.target.src = '/default_cover.jpg'; }}
                                />
                                <div className={styles.overlay}>
                                    <button
                                        className={styles.playBtn}
                                        onClick={() => handlePlayPreview(product)}
                                        title="Ouvir Preview"
                                    >
                                        <FiPlay />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.content}>
                                <div className={styles.itemHeader}>
                                    <h3 className={styles.title}>{product.title}</h3>
                                </div>
                                <span className={styles.producer}>por {product.Producer?.artisticName || 'Produtor'}</span>

                                <div className={styles.footer}>
                                    <div className={styles.meta}>
                                        <span className={styles.orderId}>#{product.orderId}</span>
                                        <span>{product.purchaseDate}</span>
                                    </div>

                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => handleDownload(product.id, product.orderId)}
                                            className={styles.downloadBtn}
                                            disabled={!product.id}
                                        >
                                            <FiDownload /> Baixar Arquivos
                                        </button>

                                        <div className={styles.badges}>
                                            <span className={styles.badge}><FiShield /> Licença Ativa</span>
                                            <span className={styles.badge}><FiPackage /> {product.type?.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {purchases.length === 0 && (
                        <div className={styles.empty}>
                            <FiPackage size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <p>Você ainda não possui produtos na sua coleção digital.</p>
                            <a href="/shop" className={styles.secondaryBtn} style={{ marginTop: 20 }}>Ir para Loja</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
