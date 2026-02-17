import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import styles from './ReviewForm.module.css'; // I'll create this css next
import api from '@/services/api';

const ReviewForm = ({ productId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/reviews', { productId, rating, comment });
            setComment('');
            setRating(5);
            if (onReviewAdded) onReviewAdded();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao enviar avaliação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <h3>Avalie este produto</h3>

            <div className={styles.stars}>
                {[...Array(5)].map((star, i) => {
                    const ratingValue = i + 1;
                    return (
                        <label key={i}>
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => setRating(ratingValue)}
                                style={{ display: 'none' }}
                            />
                            <FaStar
                                className={styles.star}
                                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                size={30}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(null)}
                            />
                        </label>
                    );
                })}
            </div>

            <textarea
                className={styles.textarea}
                placeholder="Conte sua experiência com este produto..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
            />

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
        </form>
    );
};

export default ReviewForm;
