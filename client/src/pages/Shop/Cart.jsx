import React from 'react';
import { useCart } from '../../contexts/CartContext';
import styles from './Cart.module.css';
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, total, clearCart } = useCart();
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => navigate('/shop')} className={styles.backBtn}>
                    <FiArrowLeft /> Voltar para Loja
                </button>
                <h1 className={styles.title}>Seu Carrinho</h1>
            </div>

            {cart.length === 0 ? (
                <div className={styles.empty}>
                    <FiShoppingBag size={48} />
                    <p>Seu carrinho está vazio.</p>
                    <Link to="/shop" className={styles.shopBtn}>Ir as compras</Link>
                </div>
            ) : (
                <div className={styles.cartContent}>
                    <div className={styles.items}>
                        {cart.map(item => (
                            <div key={item.id} className={styles.item}>
                                <img src={item.coverPath || '/default_cover.jpg'} alt={item.title} className={styles.cover} />
                                <div className={styles.details}>
                                    <h3>{item.title}</h3>
                                    <span>{item.Producer?.artisticName || 'Produtor'}</span>
                                    <span className={styles.price}>R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}</span>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h2>Resumo</h2>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span className={styles.totalPrice}>R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
                            Finalizar Compra
                        </button>
                        <button className={styles.clearBtn} onClick={clearCart}>
                            Limpar Carrinho
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
