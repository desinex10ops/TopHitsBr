import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import api from '../../services/api';
import { FiMusic, FiUsers, FiDisc, FiHardDrive, FiDownload, FiPlayCircle, FiActivity, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalTracks: 0,
        totalPlays: 0,
        totalDownloads: 0,
        totalArtists: 0,
        totalUsers: 0,
        storageUsageMB: 0,
        chartData: []
    });
    const [finance, setFinance] = useState({
        totalSales: 0,
        platformEarnings: 0,
        pendingWithdrawals: 0,
        totalPaidWithdrawals: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, financeRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/finance/summary')
            ]);
            setStats(statsRes.data);
            setFinance(financeRes.data.summary);
        } catch (error) {
            console.error("Erro ao carregar dados do painel:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Carregando painel...</div>;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h2 className={styles.title}>Visão Geral do Sistema</h2>
                <button className={styles.refreshBtn} onClick={loadData}>Atualizar Dados</button>
            </div>

            {/* Finance Section */}
            <div className={styles.sectionTitle}>Financeiro</div>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(75, 192, 192, 0.1)', color: '#4bc0c0' }}>
                        <FiDollarSign size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{formatCurrency(finance.totalSales)}</h3>
                        <p>Vendas Totais (GMV)</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(153, 102, 255, 0.1)', color: '#9966ff' }}>
                        <FiTrendingUp size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{formatCurrency(finance.platformEarnings)}</h3>
                        <p>Receita da Plataforma</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 159, 64, 0.1)', color: '#ff9f40' }}>
                        <FiAlertCircle size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{formatCurrency(finance.pendingWithdrawals)}</h3>
                        <p>Saques Pendentes</p>
                    </div>
                </div>
            </div>

            {/* General Stats Section */}
            <div className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Métricas Gerais</div>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(29, 185, 84, 0.1)', color: '#1db954' }}>
                        <FiMusic size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalTracks}</h3>
                        <p>Faixas</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
                        <FiPlayCircle size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalPlays.toLocaleString()}</h3>
                        <p>Total de Plays</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(153, 102, 255, 0.1)', color: '#9966ff' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalUsers}</h3>
                        <p>Usuários Totais</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 206, 86, 0.1)', color: '#ffce56' }}>
                        <FiDownload size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalDownloads.toLocaleString()}</h3>
                        <p>Downloads</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 99, 132, 0.1)', color: '#ff6384' }}>
                        <FiHardDrive size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.storageUsageMB} MB</h3>
                        <p>Uso de Disco</p>
                    </div>
                </div>
            </div>

            <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h4><FiActivity /> Atividade Recente (Últimos 7 dias)</h4>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1db954" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTracks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9966ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9966ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#181818', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area
                                    type="monotone"
                                    name="Novos Plays"
                                    dataKey="plays"
                                    stroke="#1db954"
                                    fillOpacity={1}
                                    fill="url(#colorPlays)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    name="Uploads"
                                    dataKey="tracks"
                                    stroke="#9966ff"
                                    fillOpacity={1}
                                    fill="url(#colorTracks)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
