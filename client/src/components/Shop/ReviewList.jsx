import React from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import styles from './ReviewList.module.css';

// Component to display stars (read-only)
const StarDisplay = ({ rating }) => (
    <div className={styles.stars}>
        {[...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                color={i < rating ? "#ffc107" : "#444"}
                size={16}
            />
        ))}
    </div>
);

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <p className={styles.empty}>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>;
    }

    return (
        <div className={styles.list}>
            {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.header}>
                        <div className={styles.user}>
                            {review.User?.avatar ? (
                                <img src={review.User.avatar} alt={review.User.name} className={styles.avatar} />
                            ) : (
                                <FaUserCircle size={40} color="#666" />
                            )}
                            <div>
                                <span className={styles.userName}>{review.User?.name || 'Usuário'}</span>
                                <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <StarDisplay rating={review.rating} />
                    </div>
                    {review.comment && <p className={styles.comment}>{review.comment}</p>}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
