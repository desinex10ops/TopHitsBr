import * as React from 'react';
const { useEffect, useState } = React;
import api from '../../../services/api';
import StatsCard from '../../../components/StatsCard/StatsCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Erro ao buscar stats:', error);
        }
    };

    if (!stats) return <div style={{ color: '#fff', padding: '20px' }}>Carregando estatísticas...</div>;

    return (
        <div>
            <h2 style={{ color: '#fff', marginBottom: '30px' }}>Visão Geral</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <StatsCard title="Total de Músicas" value={stats.totalTracks} icon="🎵" color="#1db954" />
                <StatsCard title="Total de Artistas" value={stats.totalArtists} icon="🎤" color="#3b82f6" />
                <StatsCard title="Plays Totais" value={stats.totalPlays} icon="▶️" color="#e50914" />
                <StatsCard title="Downloads" value={stats.totalDownloads} icon="⬇️" color="#8b5cf6" />
                <StatsCard title="Espaço em Disco" value={`${stats.storageUsageMB} MB`} icon="💾" color="#f59e0b" />
            </div>

            <div style={{ marginTop: '40px', background: '#181818', padding: '20px', borderRadius: '8px', color: '#fff' }}>
                <h3>Atividade Recente</h3>
                <p style={{ color: '#888' }}>Logs de atividade serão implementados em breve.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
