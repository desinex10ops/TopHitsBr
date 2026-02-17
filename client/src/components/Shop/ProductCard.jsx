import React from 'react';
import { getStorageUrl } from '../../utils/urlUtils';
import { FiPlay, FiPause, FiShoppingCart } from 'react-icons/fi';
import styles from './ProductCard.module.css';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';

const ProductCard = ({ product, onPlay, onAddToCart }) => {
    const { currentTrack, isPlaying } = usePlayer();
    const isCurrentTrack = currentTrack?.id === `preview-${product.id}`;
    const showaks = isCurrentTrack && isPlaying;

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <Link to={`/shop/product/${product.id}`}>
                    <img
                        src={getStorageUrl(product.coverPath)}
                        alt={product.title}
                        className={styles.image}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default_cover.jpg';
                        }}
                    />
                </Link>
                <button
                    className={styles.playBtn}
                    onClick={() => onPlay(product)}
                >
                    {showaks ? <FiPause /> : <FiPlay />}
                </button>
            </div>

            <div className={styles.info}>
                <div className={styles.meta}>
                    <span className={styles.type}>{product.type?.toUpperCase()}</span>
                    <Link to={`/shop/store/${product.Producer?.artisticName || product.Producer?.id}`} className={styles.producer}>
                        {product.Producer?.artisticName || 'Produtor'}
                    </Link>
                </div>

                <Link to={`/shop/product/${product.id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{product.title}</h3>
                </Link>

                <div className={styles.footer}>
                    <span className={styles.price}>
                        R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                        className={styles.cartBtn}
                        onClick={() => onAddToCart(product)}
                    >
                        <FiShoppingCart />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
