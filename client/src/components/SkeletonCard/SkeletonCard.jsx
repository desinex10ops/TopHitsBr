import * as React from 'react';
import styles from './SkeletonCard.module.css';

const SkeletonCard = () => {
    return (
        <div className={styles.card}>
            <div className={styles.cover}></div>
            <div className={styles.info}>
                <div className={styles.title}></div>
                <div className={styles.artist}></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
