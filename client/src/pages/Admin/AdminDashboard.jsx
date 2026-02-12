import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import api from '../../services/api';
import { FiMusic, FiUsers, FiDisc, FiHardDrive, FiDownload, FiPlayCircle, FiCpu } from 'react-icons/fi';
import StatsCard from '../../components/StatsCard/StatsCard'; // Reusing existing component if suitable, or create new style

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalTracks: 0,
        totalPlays: 0,
        totalDownloads: 0,
        totalArtists: 0,
        storageUsageMB: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Carregando painel...</div>;

    return (
        <div className={styles.dashboard}>
            <h2 className={styles.title}>Visão Geral do Sistema</h2>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(29, 185, 84, 0.1)', color: '#1db954' }}>
                        <FiMusic size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalTracks}</h3>
                        <p>Faixas Cadastradas</p>
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
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 206, 86, 0.1)', color: '#ffce56' }}>
                        <FiDownload size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalDownloads.toLocaleString()}</h3>
                        <p>Total de Downloads</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(153, 102, 255, 0.1)', color: '#9966ff' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.totalArtists}</h3>
                        <p>Artistas (Aprox)</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ background: 'rgba(255, 99, 132, 0.1)', color: '#ff6384' }}>
                        <FiHardDrive size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{stats.storageUsageMB} MB</h3>
                        <p>Espaço em Disco</p>
                    </div>
                </div>
            </div>

            {/* Placeholder for Charts */}
            <div className={styles.chartsSection}>
                <div className={styles.chartPlaceholder}>
                    <h4>Atividade Recente (Em Breve)</h4>
                    <div style={{ height: 200, background: '#222', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                        Gráfico de Uploads/Plays
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
