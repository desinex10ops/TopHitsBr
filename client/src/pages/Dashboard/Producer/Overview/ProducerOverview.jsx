import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import styles from './ProducerOverview.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const ProducerOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        sales: 0,
        pendingBalance: 0,
        chartData: [],
        topProducts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/shop/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className={styles.loading}>Carregando dados...</div>;

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Visão Geral</h1>
                <p>Bem-vindo ao seu painel, <strong>{user?.artisticName || user?.name}</strong>!</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.iconWrapper}><FiDollarSign /></div>
                    <div className={styles.statContent}>
                        <h3>Faturamento Total</h3>
                        <span>{formatCurrency(stats.revenue)}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.iconWrapper}><FiShoppingBag /></div>
                    <div className={styles.statContent}>
                        <h3>Vendas Totais</h3>
                        <span>{stats.sales}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.iconWrapper}><FiCreditCard /></div>
                    <div className={styles.statContent}>
                        <h3>Saldo Disponível</h3>
                        <span>{formatCurrency(stats.pendingBalance)}</span>
                        <a href="/dashboard/financial" className={styles.link}>Sacar</a>
                    </div>
                </div>
            </div>

            <div className={styles.chartSection}>
                <h2>Vendas (Últimos 30 Dias)</h2>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--dynamic-accent)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--dynamic-accent)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#666" />
                            <YAxis stroke="#666" />
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                            <Area type="monotone" dataKey="revenue" stroke="var(--dynamic-accent)" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.bottomGrid}>
                <div className={styles.topProducts}>
                    <h2>Top Produtos</h2>
                    <ul>
                        {stats.topProducts.map(prod => (
                            <li key={prod.id} className={styles.productItem}>
                                <div className={styles.prodInfo}>
                                    <span className={styles.prodTitle}>{prod.title}</span>
                                </div>
                                <span className={styles.prodSales}>{prod.sales} Vendas</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProducerOverview;
