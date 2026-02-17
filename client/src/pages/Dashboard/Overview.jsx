import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Overview.module.css';
import { FiMusic, FiDownload, FiUsers, FiTrendingUp, FiShoppingBag, FiStar, FiActivity, FiArrowRight, FiPlay, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color }) => (
    <div className={styles.statCard}>
        <div className={styles.iconBox} style={{ background: `${color}20`, color: color }}>
            {icon}
        </div>
        <div className={styles.statInfo}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{title}</span>
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
    const [loading, setLoading] = useState(true);

    const isProducer = user?.type === 'artist' || user?.type === 'admin';

    useEffect(() => {
        const fetchStats = async () => {
            if (!isProducer) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/music/artist/stats');
                setStats(data);
            } catch (error) {
                console.error("Error fetching overview stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [isProducer]);

    return (
        <div className={styles.container}>
            <div className={styles.welcomeSection}>
                <h1 className={styles.welcomeTitle}>Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋</h1>
                <p className={styles.welcomeSubtitle}>
                    {isProducer
                        ? "Aqui está o resumo do desempenho da sua carreira artística."
                        : "Bem-vindo de volta! Explore novos sons e gerencie sua coleção digital."}
                </p>
            </div>

            {isProducer && !user?.isSeller && user?.type !== 'admin' && (
                <div className={styles.sellerCta}>
                    <div className={styles.ctaContent}>
                        <h2>Comece a vender hoje mesmo 💰</h2>
                        <p>Ganhe dinheiro vendendo seus Beats,Samples e Instrumentais no nosso Marketplace Global.</p>
                        <Link to="/dashboard/become-seller" className={styles.ctaBtn}>Ativar meu Catálogo de Vendas</Link>
                    </div>
                </div>
            )}

            {/* Stats Grid - Contextualized */}
            <div className={styles.statsGrid}>
                {isProducer ? (
                    <>
                        <StatCard title="Total de Plays" value={stats.totalPlays || 0} icon={<FiMusic />} color="#1DB954" />
                        <StatCard title="Seguidores" value={stats.followers || 0} icon={<FiUsers />} color="#2E77D0" />
                        {(user?.isSeller || user?.type === 'admin') && (
                            <>
                                <StatCard title="Produtos Ativos" value={stats.productsCount || 0} icon={<FiShoppingBag />} color="#ec4899" />
                                <StatCard title="Ganhos Estimados" value={`R$ ${stats.revenue || '0,00'}`} icon={<FiStar />} color="#a855f7" />
                            </>
                        )}
                        {(!user?.isSeller && user?.type !== 'admin') && (
                            <StatCard title="Engajamento" value="8.4%" icon={<FiActivity />} color="#F59B23" />
                        )}
                    </>
                ) : (
                    <>
                        <StatCard title="Músicas Curtidas" value={stats.likedSongs || 0} icon={<FiStar />} color="#ec4899" />
                        <StatCard title="Minhas Compras" value={stats.purchases || 0} icon={<FiShoppingBag />} color="#3b82f6" />
                        <StatCard title="Playlists" value={stats.playlistsCount || 0} icon={<FiMusic />} color="#1DB954" />
                        <StatCard title="Créditos" value="R$ 0,00" icon={<FiStar />} color="#eab308" />
                    </>
                )}
            </div>

            <div className={styles.sectionsGrid}>
                {/* Main Activities */}
                <div className={styles.mainSection}>
                    <div className={styles.glassCard}>
                        <h3 className={styles.cardTitle}><FiActivity /> Atividade Recente</h3>
                        <div className={styles.activityList}>
                            <div className={styles.emptyState}>
                                <p>Nenhuma atividade recente registrada nos últimos 7 dias.</p>
                            </div>
                        </div>
                    </div>

                    {isProducer && (
                        <div className={styles.glassCard}>
                            <h3 className={styles.cardTitle}><FiTrendingUp /> Destaques do Mês</h3>
                            <div className={styles.emptyState}>
                                <p>Aguardando dados suficientes para gerar insights.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Widgets */}
                <div className={styles.sidebarSection}>
                    <div className={styles.glassCard}>
                        <h3 className={styles.cardTitle}>Acesso Rápido</h3>
                        <div className={styles.quickLinks}>
                            {isProducer ? (
                                <>
                                    <Link to="/dashboard/uploads" className={styles.quickLink}><FiDownload /> Novo Upload</Link>
                                    <Link to="/dashboard/boosts" className={styles.quickLink}><FiTrendingUp /> Meus Impulsionamentos</Link>
                                    <Link to="/dashboard/marketing" className={styles.quickLink}><FiTrendingUp /> Marketing</Link>
                                    {(user?.isSeller || user?.type === 'admin') && (
                                        <Link to="/dashboard/financial" className={styles.quickLink}><FiStar /> Financeiro</Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link to="/shop" className={styles.quickLink}><FiShoppingBag /> Ir para Loja</Link>
                                    <Link to="/dashboard/playlists" className={styles.quickLink}><FiPlay /> Minhas Playlists</Link>
                                    <Link to="/explore" className={styles.quickLink}><FiMusic /> Explorar Músicas</Link>
                                </>
                            )}
                            <Link to="/dashboard/settings" className={styles.quickLink}><FiSettings /> Configurações</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
