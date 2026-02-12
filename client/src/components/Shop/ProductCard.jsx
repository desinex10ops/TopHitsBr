import { getStorageUrl } from '../../utils/urlUtils';
import React from 'react';
import { FiPlay, FiShoppingCart, FiUser } from 'react-icons/fi';
import styles from './ProductCard.module.css';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onPlay, onAddToCart }) => {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <img
                    src={getStorageUrl(product.coverPath)}
                    alt={product.title}
                    className={styles.cover}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default_cover.jpg'; // Frontend public fallback
                    }}
                />
                <div className={styles.overlay}>
                    <button className={styles.playBtn} onClick={() => onPlay(product)}>
                        <FiPlay />
                    </button>
                </div>
                <div className={styles.typeBadge}>{product.type.toUpperCase()}</div>
            </div>

            <div className={styles.info}>
                <Link to={`/shop/product/${product.id}`} className={styles.title}>{product.title}</Link>

                <div className={styles.producerRow}>
                    <Link to={`/shop/store/${product.Producer?.link || product.Producer?.id}`} className={styles.producerLink}>
                        {product.Producer?.artisticName || 'Produtor'}
                        {/* Simulated Verified Badge for everyone for now, or check specific ID */}
                        <span className={styles.verifiedBadge} title="Verificado">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3D91FF" />
                            </svg>
                        </span>
                    </Link>
                </div>

                <div className={styles.topSellerLabel}>VENDEDOR TOP SELLER</div>

                <div className={styles.statsRow}>
                    <span className={styles.salesCount}>100 vendidos</span>
                </div>

                <div className={styles.footer}>
                    <span className={styles.price}>
                        R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <button className={styles.cartBtn} onClick={() => onAddToCart(product)}>
                        <FiShoppingCart />
                    </button>
                </div>

                <Link to={`/shop/store/${product.Producer?.link || product.Producer?.id}`} className={styles.viewStoreBtn}>
                    VER LOJA
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
