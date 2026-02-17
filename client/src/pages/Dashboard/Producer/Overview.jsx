import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './Overview.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';
import { getStorageUrl } from '../../../utils/urlUtils';

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/shop/stats');
            setStats(response.data);
        } catch (error) {
            console.error(error);
            // addToast('Erro ao carregar estatísticas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Carregando painel...</div>;

    if (!stats) return <div className={styles.error}>Não foi possível carregar os dados.</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Visão Geral</h1>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(29, 185, 84, 0.2)', color: '#1db954' }}>
                        <FiDollarSign />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiLabel}>Faturamento Total</span>
                        <span className={styles.kpiValue}>R$ {stats.revenue.toFixed(2)}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }}>
                        <FiActivity />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiLabel}>Lucro Líquido</span>
                        <span className={styles.kpiValue}>R$ {stats.profit.toFixed(2)}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(0, 123, 255, 0.2)', color: '#007bff' }}>
                        <FiShoppingBag />
                    </div>
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiLabel}>Vendas Totais</span>
                        <span className={styles.kpiValue}>{stats.sales}</span>
                    </div>
                </div>
            </div>

            <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                    <h3>Desempenho de Vendas (7 dias)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1db954" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <Tooltip
                                    contentStyle={{ background: '#222', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="uv" stroke="#1db954" fillOpacity={1} fill="url(#colorPv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>Produtos Mais Vendidos</h3>
                    <div className={styles.topProductsList}>
                        {stats.topProducts.map((product, index) => (
                            <div key={product.id} className={styles.topProductItem}>
                                <span className={styles.rank}>#{index + 1}</span>
                                <img src={getStorageUrl(product.coverPath)} alt="" className={styles.thumb} />
                                <div className={styles.prodInfo}>
                                    <span className={styles.prodTitle}>{product.title}</span>
                                    <span className={styles.prodSales}>{product.salesCount} vendas</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
