import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';
import { FiMusic, FiDownload, FiUsers, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: '#181818',
        padding: 20,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        border: '1px solid #333'
    }}>
        <div style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: `${color}20`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
        }}>
            {icon}
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{value}</h3>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>{title}</span>
        </div>
    </div>
);

const Overview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPlays: 0,
        uploads: 0,
        followers: 0,
        ...user?.stats
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Reuse the endpoint created for DashboardStats
                const { data } = await api.get('/music/artist/stats');
                setStats(data);
            } catch (error) {
                console.error("Error fetching overview stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className={styles.pageContent}>
            <h2 style={{ marginBottom: 30 }}>Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
                <StatCard title="Total de Plays" value={stats.totalPlays || 0} icon={<FiMusic />} color="#1DB954" />
                <StatCard title="Uploads" value={stats.uploads || 0} icon={<FiDownload />} color="#3b82f6" />
                <StatCard title="Seguidores" value={stats.followers || 0} icon={<FiUsers />} color="#eab308" />
                <StatCard title="Crescimento" value="+0%" icon={<FiTrendingUp />} color="#a855f7" />
            </div>

            <div style={{ background: '#181818', padding: 25, borderRadius: 10, border: '1px solid #333' }}>
                <h3 style={{ marginTop: 0 }}>Atividade Recente</h3>
                <p style={{ color: '#888' }}>Nenhuma atividade recente registrada.</p>
            </div>
        </div>
    );
};

export default Overview;
