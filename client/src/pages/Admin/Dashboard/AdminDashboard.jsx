import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import api from '../../../services/api';
import { FiMusic, FiUsers, FiDisc, FiHardDrive, FiDownload, FiPlayCircle, FiActivity, FiBell } from 'react-icons/fi';
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
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, notifsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/music/admin/notifications')
            ]);
            setStats(statsRes.data);
            setNotifications(notifsRes.data.slice(0, 5));
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'danger': return <FiActivity className={styles.statusDanger} />;
            case 'warning': return <FiActivity className={styles.statusWarning} />;
            case 'success': return <FiActivity className={styles.statusSuccess} />;
            default: return <FiActivity className={styles.statusInfo} />;
        }
    };

    if (loading) return <div className={styles.loading}>Carregando painel...</div>;

    const handleExportSales = () => {
        window.open(`${api.defaults.baseURL}/shop/admin/export-sales`, '_blank');
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={styles.refreshBtn} onClick={loadData}>Atualizar Dados</button>
                    <button className={styles.exportBtn} onClick={handleExportSales}>
                        <FiDownload /> Exportar Vendas (CSV)
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(29, 185, 84, 0.1)', color: 'var(--dynamic-accent)' }}>
                        <FiMusic size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats?.totalTracks || 0}</h3>
                        <p>Faixas</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(54, 162, 235, 0.1)', color: '#36a2eb' }}>
                        <FiPlayCircle size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{(stats?.totalPlays || 0).toLocaleString()}</h3>
                        <p>Total de Plays</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(153, 102, 255, 0.1)', color: '#9966ff' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats?.totalUsers || 0}</h3>
                        <p>Usuários Totais</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 206, 86, 0.1)', color: '#ffce56' }}>
                        <FiDownload size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{(stats?.totalDownloads || 0).toLocaleString()}</h3>
                        <p>Downloads</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 99, 132, 0.1)', color: '#ff6384' }}>
                        <FiHardDrive size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats?.storageUsageMB || 0} MB</h3>
                        <p>Uso de Disco</p>
                    </div>
                </div>
            </div>

            <div className={styles.chartsSection}>
                <div className={styles.chartCard} style={{ marginBottom: '30px' }}>
                    <div className={styles.chartHeader}>
                        <h4><FiActivity /> Atividade Recente (Últimos 7 dias)</h4>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--dynamic-accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--dynamic-accent)" stopOpacity={0} />
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
                                    stroke="var(--dynamic-accent)"
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

                <div className={styles.alertsCard}>
                    <div className={styles.chartHeader}>
                        <h4><FiBell /> Alertas do Sistema</h4>
                    </div>
                    <div className={styles.alertsList}>
                        {notifications.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Tudo sob controle. Nenhum alerta recente.</p>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={styles.alertItem}>
                                    <div className={styles.alertIcon}>{getAlertIcon(notif.type)}</div>
                                    <div className={styles.alertContent}>
                                        <span className={styles.alertTitle}>{notif.title}</span>
                                        <span className={styles.alertMessage}>{notif.message}</span>
                                    </div>
                                    <div className={styles.alertTime}>{new Date(notif.createdAt).toLocaleDateString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
