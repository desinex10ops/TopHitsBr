import { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiMusic, FiTrendingUp, FiDollarSign, FiShoppingBag, FiActivity } from 'react-icons/fi';
import styles from './Dashboard.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const DashboardStats = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('music');

    // Music Stats
    const [musicStats, setMusicStats] = useState({
        totalPlays: 0,
        followers: 0,
        uploads: 0,
        topTracks: []
    });

    // Sales Stats
    const [salesStats, setSalesStats] = useState({
        revenue: 0,
        profit: 0,
        sales: 0,
        chartData: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const musicRes = await api.get('/music/artist/stats');
            setMusicStats(musicRes.data);

            if (user?.type === 'artist' || user?.type === 'admin') {
                try {
                    const shopRes = await api.get('/shop/stats');
                    setSalesStats(shopRes.data);
                } catch (err) {
                    console.error("Erro ao carregar vendas:", err);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Carregando estatísticas...</p></div>;

    const maxPlays = musicStats.topTracks.length > 0 ? Math.max(...musicStats.topTracks.map(t => t.plays)) : 100;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Estatísticas</h2>
                    <p className={styles.subtitle}>Desempenho detalhado</p>
                </div>
            </div>

            {/* Tab Navigation */}
            {(user?.isSeller || user?.type === 'admin') && (
                <div className={styles.tabs} style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #333' }}>
                    <button
                        onClick={() => setActiveTab('music')}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'music' ? '2px solid var(--dynamic-accent)' : '2px solid transparent',
                            color: activeTab === 'music' ? '#fff' : '#b3b3b3',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Música & Streaming
                    </button>
                    <button
                        onClick={() => setActiveTab('sales')}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'sales' ? '2px solid var(--dynamic-accent)' : '2px solid transparent',
                            color: activeTab === 'sales' ? '#fff' : '#b3b3b3',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Vendas & Loja
                    </button>
                </div>
            )}

            {/* MUSIC TAB CONTENT */}
            {activeTab === 'music' && (
                <>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(29, 185, 84, 0.1)', color: 'var(--dynamic-accent)' }}>
                                <FiBarChart2 />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>{musicStats.totalPlays.toLocaleString()}</h3>
                                <p>Total de Plays</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
                                <FiUsers />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>{musicStats.followers.toLocaleString()}</h3>
                                <p>Seguidores</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(255, 206, 86, 0.1)', color: '#ffce56' }}>
                                <FiMusic />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>{musicStats.uploads}</h3>
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

                    <div className={styles.chartSection}>
                        <h3 className={styles.chartTitle}>Músicas Mais Ouvidas</h3>
                        <div className={styles.barChart}>
                            {musicStats.topTracks.map((track, index) => (
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
                </>
            )}

            {/* SALES TAB CONTENT */}
            {activeTab === 'sales' && (
                <>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(29, 185, 84, 0.2)', color: 'var(--dynamic-accent)' }}>
                                <FiDollarSign />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>R$ {salesStats.revenue?.toFixed(2) || '0.00'}</h3>
                                <p>Faturamento Total</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }}>
                                <FiActivity />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>R$ {salesStats.profit?.toFixed(2) || '0.00'}</h3>
                                <p>Lucro Líquido</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(0, 123, 255, 0.2)', color: '#007bff' }}>
                                <FiShoppingBag />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>{salesStats.sales || 0}</h3>
                                <p>Vendas Totais</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartSection}>
                        <h3 className={styles.chartTitle}>Desempenho de Vendas (30 dias)</h3>
                        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                            <ResponsiveContainer>
                                <AreaChart data={salesStats.chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--dynamic-accent)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--dynamic-accent)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <Tooltip
                                        contentStyle={{ background: '#222', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => `R$ ${value.toFixed(2)}`}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--dynamic-accent)" fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardStats;
