import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiPlay, FiUsers, FiDollarSign, FiActivity } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import styles from './GrowthCards.module.css';

const GrowthCards = () => {
    const { user } = useAuth();

    const allMetrics = [
        {
            id: 1,
            label: 'Plays Totais',
            value: '2.4M',
            change: '+12.5%',
            positive: true,
            icon: <FiPlay />,
            color: '#1db954'
        },
        {
            id: 2,
            label: 'Seguidores',
            value: '85.2K',
            change: '+1.7K',
            positive: true,
            icon: <FiUsers />,
            color: '#2E77D0'
        },
        {
            id: 3,
            label: 'Receita Estimada',
            value: 'R$ 12.5K',
            change: '+5.2%',
            positive: true,
            icon: <FiDollarSign />,
            color: '#E91E63',
            sellerOnly: true
        },
        {
            id: 4,
            label: 'Engajamento',
            value: '8.4%',
            change: '-1.2%',
            positive: false,
            icon: <FiActivity />,
            color: '#F59B23'
        }
    ];

    const metrics = allMetrics.filter(m => !m.sellerOnly || user?.isSeller || user?.type === 'admin');

    return (
        <div className={styles.grid}>
            {metrics.map(metric => (
                <div key={metric.id} className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.iconBox} style={{ background: `${metric.color}20`, color: metric.color }}>
                            {metric.icon}
                        </div>
                        <span className={`
                            ${styles.change} 
                            ${metric.positive ? styles.changePos : styles.changeNeg}
                        `}>
                            {metric.positive ? <FiTrendingUp /> : <FiTrendingDown />}
                            {metric.change}
                        </span>
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>{metric.value}</span>
                        <span className={styles.label}>{metric.label}</span>
                    </div>
                    <div className={styles.miniChart}>
                        {/* CSS-only simple sparkline effect */}
                        <div className={styles.bar} style={{ height: '40%' }}></div>
                        <div className={styles.bar} style={{ height: '70%' }}></div>
                        <div className={styles.bar} style={{ height: '50%' }}></div>
                        <div className={styles.bar} style={{ height: '100%' }}></div>
                        <div className={styles.bar} style={{ height: '80%' }}></div>
                        <div className={styles.bar} style={{ height: '60%' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GrowthCards;
