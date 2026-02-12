import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [success, setSuccess] = useState(false);

    const handlePayment = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Preference (Order)
            const items = cart.map(item => ({ id: item.id, quantity: 1 })); // Assuming qty 1 for now
            const response = await api.post('/payment/checkout', {
                items,
                buyerId: user.id
            });

            const { id, init_point } = response.data;
            setOrderId(id);

            // Redirect to Real Mercado Pago Checkout
            if (init_point) {
                window.location.href = init_point;
            } else {
                alert("Erro ao gerar link de pagamento.");
                setLoading(false);
            }

            // Mock Simulation Removed

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Erro ao processar checkout.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <FiCheckCircle className={styles.successIcon} />
                    <h1>Pagamento Aprovado!</h1>
                    <p>Seus produtos já estão liberados para download.</p>
                    <button onClick={() => navigate('/dashboard/purchases')} className={styles.button}>
                        Meus Pedidos
                    </button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className={styles.container}>
                <h2>Seu carrinho está vazio.</h2>
                <button onClick={() => navigate('/shop')}>Voltar para Loja</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.checkoutGrid}>
                {/* Summary */}
                <div className={styles.summarySection}>
                    <h2>Resumo do Pedido</h2>
                    <div className={styles.items}>
                        {cart.map(item => (
                            <div key={item.id} className={styles.itemRow}>
                                <span>{item.title}</span>
                                <span>R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className={styles.paymentSection}>
                    <h2>Forma de Pagamento</h2>
                    <p className={styles.secureText}><FiLock /> Ambiente Seguro</p>

                    <div className={styles.methods}>
                        <div className={`${styles.methodCard} ${styles.active}`}>
                            <img src="/pix-logo.png" alt="PIX" className={styles.methodIcon} /> {/* Placeholder */}
                            <span>PIX (Aprovação Imediata)</span>
                        </div>
                        {/* Future: Credit Card */}
                        <div className={`${styles.methodCard} ${styles.disabled}`}>
                            <span>Cartão de Crédito (Em breve)</span>
                        </div>
                    </div>

                    <button
                        className={styles.payButton}
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2).replace('.', ',')}`}
                    </button>
                    {loading && <p className={styles.loadingText}>Simulando pagamento no banco...</p>}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
