import { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiMusic, FiTrendingUp } from 'react-icons/fi';
import styles from './Dashboard.module.css';
import { useAuth } from '../../contexts/AuthContext';

import api from '../../services/api';

const DashboardStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPlays: 0,
        followers: 0,
        uploads: 0,
        topTracks: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/music/artist/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className={styles.container}><p>Carregando estatísticas...</p></div>;

    const maxPlays = stats.topTracks.length > 0 ? Math.max(...stats.topTracks.map(t => t.plays)) : 100;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Estatísticas</h2>
                    <p className={styles.subtitle}>Desempenho do seu perfil</p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(29, 185, 84, 0.1)', color: '#1DB954' }}>
                        <FiBarChart2 />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.totalPlays.toLocaleString()}</h3>
                        <p>Total de Plays</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
                        <FiUsers />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.followers.toLocaleString()}</h3>
                        <p>Seguidores</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255, 206, 86, 0.1)', color: '#ffce56' }}>
                        <FiMusic />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.uploads}</h3>
                        <p>Uploads</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255, 99, 132, 0.1)', color: '#ff6384' }}>
                        <FiTrendingUp />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>+15%</h3>
                        <p>Crescimento (30d)</p>
                    </div>
                </div>
            </div>

            {/* Top Internal Chart */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>Músicas Mais Ouvidas</h3>
                <div className={styles.barChart}>
                    {stats.topTracks.map((track, index) => (
                        <div key={index} className={styles.barRow}>
                            <span className={styles.barLabel}>{track.name}</span>
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${(track.plays / maxPlays) * 100}%` }}
                                ></div>
                            </div>
                            <span className={styles.barValue}>{track.plays.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
