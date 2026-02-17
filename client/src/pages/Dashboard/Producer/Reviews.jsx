import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import styles from './Reviews.module.css';
import { FiStar, FiUser, FiPackage } from 'react-icons/fi';
import { getStorageUrl } from '@/utils/urlUtils';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reviews/producer/all');
            setReviews(response.data.reviews);
            setStats({
                average: response.data.average,
                total: response.data.total
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Carregando avaliações...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Avaliações dos seus Produtos</h1>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>★ {stats.average}</span>
                        <span className={styles.statLabel}>Média Geral</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total de Avaliações</span>
                    </div>
                </div>
            </div>

            <div className={styles.list}>
                {reviews.length === 0 ? (
                    <p className={styles.empty}>Nenhuma avaliação recebida ainda.</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className={styles.card}>
                            <div className={styles.productInfo}>
                                <img
                                    src={getStorageUrl(review.Product?.coverPath) || '/default_cover.jpg'}
                                    className={styles.cover}
                                    alt="Product"
                                />
                                <span className={styles.productTitle}>{review.Product?.title}</span>
                            </div>

                            <div className={styles.reviewContent}>
                                <div className={styles.ratingRow}>
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            fill={i < review.rating ? "#ffc107" : "none"}
                                            color={i < review.rating ? "#ffc107" : "#666"}
                                        />
                                    ))}
                                    <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className={styles.comment}>{review.comment}</p>
                                <div className={styles.reviewer}>
                                    <FiUser /> {review.User?.name || 'Usuário'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;
