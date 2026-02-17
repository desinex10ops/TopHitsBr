import React from 'react';
import styles from './TabStyles.module.css';
import { FiTrendingUp, FiMusic, FiHeart, FiPlay } from 'react-icons/fi';

const TabStats = () => {
    // Mock stats for the tab view
    const stats = [
        { label: 'Alcance Mensal', value: '12.4K', trend: '+15%', icon: <FiTrendingUp />, color: '#1db954' },
        { label: 'Músicas Lançadas', value: '28', trend: '', icon: <FiMusic />, color: '#2E77D0' },
        { label: 'Total de Curtidas', value: '4.2K', trend: '+5%', icon: <FiHeart />, color: '#E91E63' },
        { label: 'Streams Totais', value: '1.2M', trend: '+22%', icon: <FiPlay />, color: '#F59B23' },
    ];

    return (
        <div className={styles.tabContainer}>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiTrendingUp /> Visão Geral de Performance
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ background: '#222', padding: 20, borderRadius: 12, border: '1px solid #333' }}>
                            <div style={{ color: s.color, marginBottom: 10, fontSize: '1.2rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase' }}>{s.label}</div>
                            {s.trend && <div style={{ fontSize: '0.75rem', color: '#1db954', marginTop: 5 }}>{s.trend} este mês</div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.card} style={{ opacity: 0.6, cursor: 'default' }}>
                <h3 className={styles.cardTitle}>Demografia do Público (Em breve)</h3>
                <p style={{ color: '#888' }}>
                    Estamos processando seus dados de audiência. Logo você poderá ver de onde vêm seus maiores fãs.
                </p>
            </div>
        </div>
    );
};

export default TabStats;
