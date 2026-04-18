import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import styles from './Checkout.module.css';
import { FiLock } from 'react-icons/fi';
import api from '../../services/api';

const Checkout = () => {
    const { cart, total, clearCart, coupon } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Preference (Order)
            const items = cart.map(item => ({ id: item.id, quantity: 1 }));
            const response = await api.post('/payment/checkout', {
                items,
                buyerId: user.id,
                couponCode: coupon?.code
            });

            const { init_point } = response.data;

            // Redirect to Real Mercado Pago Checkout
            if (init_point) {
                window.location.href = init_point;
            } else {
                addToast("Erro ao gerar link de pagamento.", "error");
                setLoading(false);
            }

        } catch (error) {
            console.error("Checkout error:", error);
            addToast("Erro ao processar checkout.", "error");
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className={styles.container}>
                <h2>Seu carrinho está vazio.</h2>
                <button onClick={() => navigate('/shop')} className={styles.button}>Voltar para Loja</button>
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
                    {coupon && (
                        <div className={styles.itemRow} style={{ color: 'var(--dynamic-accent)' }}>
                            <span>Cupom: {coupon.code}</span>
                            <span>-{coupon.discountPercentage}%</span>
                        </div>
                    )}
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
                            <img src="https://img.icons8.com/color/48/mercadopago.png" alt="MP" className={styles.methodIcon} style={{ width: 32 }} />
                            <div>
                                <span style={{ display: 'block', fontWeight: 'bold' }}>Mercado Pago</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>Pix, Cartão de Crédito, Boleto</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className={styles.payButton}
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2).replace('.', ',')}`}
                    </button>
                    <p className={styles.loadingText} style={{ fontSize: '0.8rem', marginTop: 15 }}>
                        Você será redirecionado para o Mercado Pago para finalizar.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
