import * as React from 'react';
const { useState, useEffect } = React;
import api from '../../services/api';
import styles from './MyBoosts.module.css';
import { FiTrendingUp, FiActivity, FiZap, FiStar, FiClock, FiTarget } from 'react-icons/fi';

const MyBoosts = () => {
    const [boosts, setBoosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoosts();
    }, []);

    const fetchBoosts = async () => {
        try {
            const response = await api.get('/credits/boost');
            setBoosts(response.data);
        } catch (error) {
            console.error("Erro ao buscar boosts:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTierIcon = (tier) => {
        switch (tier) {
            case 'premium': return <FiStar color="#ffaa00" />;
            case 'advanced': return <FiZap color="#00ccff" />;
            default: return <FiActivity color="#888" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#00ff88';
            case 'expired': return '#666';
            case 'paused': return '#ffaa00';
            default: return '#fff';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2><FiTrendingUp /> Meus Impulsionamentos</h2>
                <p>Acompanhe o desempenho das suas campanhas em tempo real.</p>
            </div>

            {loading ? (
                <div className={styles.loading}>Carregando...</div>
            ) : boosts.length === 0 ? (
                <div className={styles.emptyState}>
                    <FiTrendingUp size={48} />
                    <p>Você ainda não tem impulsionamentos ativos.</p>
                    <button onClick={() => window.location.href = '/dashboard/uploads'}>Impulsionar Agora</button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {boosts.map(boost => {
                        const progress = Math.min((boost.impressions / (boost.targetImpressions || 1)) * 100, 100);
                        const daysLeft = Math.ceil((new Date(boost.endDate) - new Date()) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={boost.id} className={`${styles.card} ${styles[boost.tier]}`}>
                                {boost.smartBoostActive && <div className={styles.smartBadge}>🤖 Smart Boost Ativo</div>}

                                <div className={styles.cardHeader}>
                                    <span className={styles.tierIcon}>{getTierIcon(boost.tier)}</span>
                                    <div className={styles.targetInfo}>
                                        <h3>{boost.targetName || `Campanha #${boost.id}`}</h3>
                                        <span className={styles.typeBadge}>{boost.type === 'album' ? 'Álbum' : 'Música'}</span>
                                    </div>
                                    <span className={styles.status} style={{ color: getStatusColor(boost.status) }}>
                                        {boost.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className={styles.metrics}>
                                    <div className={styles.metric}>
                                        <span className={styles.label}>Impressões</span>
                                        <span className={styles.value}>{boost.impressions.toLocaleString()} <small>/ {boost.targetImpressions?.toLocaleString()}</small></span>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.detail}>
                                            <FiActivity /> Score: <strong>{Math.round(boost.currentScore)}</strong>
                                        </div>
                                        <div className={styles.detail}>
                                            <FiClock /> Restam: <strong>{daysLeft > 0 ? daysLeft : 0} dias</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBoosts;
