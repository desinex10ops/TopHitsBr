import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ title, value, icon, color }) => {
    return (
        <div className={styles.card} style={{ borderBottomColor: color }}>
            <div className={styles.info}>
                <span className={styles.title}>{title}</span>
                <span className={styles.value}>{value}</span>
            </div>
            <div className={styles.icon} style={{ color: color }}>
                {icon}
            </div>
        </div>
    );
};

export default StatsCard;
