import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import styles from './ProductDetails.module.css';
import { FiShoppingCart, FiPlay, FiPause, FiArrowLeft } from 'react-icons/fi';
import ReviewForm from '@/components/Shop/ReviewForm';
import ReviewList from '@/components/Shop/ReviewList';
import { useAuth } from '@/contexts/AuthContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false); // Placeholder for preview logic
    const [hasPurchased, setHasPurchased] = useState(false);

    useEffect(() => {
        fetchProductData();
    }, [id, user]);

    const fetchProductData = async () => {
        try {
            setLoading(true);

            const reqs = [
                api.get(`/shop/products/${id}`),
                api.get(`/reviews/${id}`)
            ];

            if (user) {
                reqs.push(api.get(`/shop/check-purchase/${id}`));
            }

            const [prodRes, revRes, purchaseRes] = await Promise.all(reqs);

            setProduct(prodRes.data);
            setReviews(revRes.data.reviews);
            setRatingStats({
                average: revRes.data.average,
                total: revRes.data.total
            });

            if (purchaseRes) {
                setHasPurchased(purchaseRes.data.hasPurchased);
            }

        } catch (error) {
            console.error("Erro ao carregar produto:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewAdded = () => {
        fetchProductData(); // Refresh reviews
    };

    if (loading) return <div className="loading-spinner">Carregando...</div>;
    if (!product) return <div className={styles.container}>Produto não encontrado.</div>;

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
                <FiArrowLeft /> Voltar
            </button>

            <div className={styles.mainContent}>
                {/* Left: Image */}
                <div className={styles.imageContainer}>
                    <img src={product.coverPath || '/default_cover.jpg'} alt={product.title} className={styles.cover} />
                </div>

                {/* Right: Info */}
                <div className={styles.infoContainer}>
                    <h1 className={styles.title}>{product.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.type}>{product.type?.toUpperCase()}</span>
                        <Link to={`/shop/store/${product.Producer?.artisticName || product.Producer?.id}`} className={styles.producer}>
                            Por: {product.Producer?.artisticName || 'Produtor'}
                        </Link>
                    </div>

                    <div className={styles.ratingSummary}>
                        <span className={styles.stars}>★ {ratingStats.average}</span>
                        <span className={styles.count}>({ratingStats.total} avaliações)</span>
                    </div>

                    <div className={styles.priceSection}>
                        <span className={styles.price}>R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                        {hasPurchased ? (
                            <button onClick={() => navigate('/dashboard/purchases')} className={styles.downloadBtn}>
                                Baixar Arquivo
                            </button>
                        ) : (
                            <button onClick={() => addToCart(product)} className={styles.cartBtn}>
                                <FiShoppingCart /> Adicionar ao Carrinho
                            </button>
                        )}
                    </div>

                    <div className={styles.description}>
                        <h3>Sobre</h3>
                        <p>{product.description || 'Sem descrição.'}</p>
                    </div>

                    {/* Audio Preview could go here */}
                </div>
            </div>

            <div className={styles.reviewsSection}>
                <h2>Avaliações</h2>

                {/* Show Form only if user has purchased the product */}
                {user && hasPurchased && (
                    <ReviewForm productId={product.id} onReviewAdded={handleReviewAdded} />
                )}

                {user && !hasPurchased && (
                    <p className={styles.reviewLocked}>Você precisa comprar este produto para deixar uma avaliação.</p>
                )}

                {!user && (
                    <p className={styles.reviewLocked}>Faça login para deixar uma avaliação.</p>
                )}

                <ReviewList reviews={reviews} />
            </div>
        </div>
    );
};

export default ProductDetails;
