import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Dashboard.module.css';

// Ícones
import {
    FiHome, FiUser, FiMusic, FiList, FiMessageSquare, FiBarChart2, FiBell,
    FiSettings, FiLogOut, FiMenu, FiX, FiTrendingUp, FiDollarSign,
    FiShoppingBag, FiStar, FiBox, FiMessageCircle, FiArchive, FiDisc,
    FiChevronLeft, FiPlus, FiGrid, FiDatabase, FiSmartphone, FiInstagram,
    FiYoutube, FiGlobe, FiHeart
} from 'react-icons/fi';

import Overview from './Overview';
import Profile from './Profile/Profile';
import MyUploads from './MyUploads';
import MyBoosts from './MyBoosts';
import DashboardPlaylists from './DashboardPlaylists';
import DashboardComments from './DashboardComments';
import DashboardStats from './DashboardStats';
import DashboardSettings from './DashboardSettings';
import Wallet from '../Wallet/Wallet';
import ProducerProducts from './Producer/Products/ProducerProducts';
import ProducerFinance from './Producer/Finance/ProducerFinance';
import ProducerOverview from './Producer/Overview/ProducerOverview'; // [NEW]
import Orders from './Producer/Orders'; // Keep if exists or replace later
import Marketing from './Producer/Marketing/Marketing';
import MyPurchases from './Purchases/MyPurchases';
import ProducerReviews from './Producer/Reviews';
import Library from '../Library/Library'; // [NEW]
import ChatPage from './Chat/ChatPage'; // Import ChatPage
import BecomeSeller from './BecomeSeller'; // [NEW] Phase 6
import DashboardMobileNav from '../../components/Dashboard/DashboardMobileNav';
import logoImg from '../../assets/logo_tophits.png';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleMobile = () => setMobileOpen(!mobileOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const menuItems = [
        { path: '/dashboard', label: 'Visão Geral', icon: <FiHome /> },
        { path: '/notifications', label: 'Notificações', icon: <FiBell /> }, // [NEW] Link direto
        { path: '/dashboard/library', label: 'Minha Biblioteca', icon: <FiHeart /> },
        { path: '/dashboard/chat', label: 'Mensagens', icon: <FiMessageCircle /> },
        { path: '/dashboard/profile', label: 'Meu Perfil', icon: <FiUser /> },
    ];

    // Listener features
    if (user?.type === 'listener' || user?.type === 'admin') {
        menuItems.push({ path: '/dashboard/purchases', label: 'Minha Coleção', icon: <FiArchive /> });
    }

    if (user?.type === 'artist' || user?.type === 'admin') {
        menuItems.push(
            { path: '/dashboard/uploads', label: 'Meus Álbuns', icon: <FiMusic /> },
            { path: '/dashboard/boosts', label: 'Impulsionamentos', icon: <FiTrendingUp /> },
            { path: '/dashboard/marketing', label: 'Crescimento', icon: <FiBarChart2 /> },
            { path: '/dashboard/wallet', label: 'Minha Carteira', icon: <FiShoppingBag /> }
        );

        if (user?.isSeller || user?.type === 'admin') {
            menuItems.push(
                { path: '/dashboard/products', label: 'Catálogo', icon: <FiBox /> },
                { path: '/dashboard/orders', label: 'Vendas', icon: <FiDollarSign /> },
                { path: '/dashboard/financial', label: 'Financeiro', icon: <FiDollarSign /> },
                { path: '/dashboard/reviews-producer', label: 'Feedback', icon: <FiStar /> }
            );
        } else {
            menuItems.push(
                { path: '/dashboard/become-seller', label: 'Seja um Vendedor', icon: <FiDollarSign />, color: '#1DB954' }
            );
        }
    }

    menuItems.push(
        { path: '/dashboard/playlists', label: 'Playlists', icon: <FiDisc /> },
        { path: '/dashboard/comments', label: 'Comentários', icon: <FiMessageSquare /> },
        { path: '/dashboard/stats', label: 'Análise', icon: <FiBarChart2 /> },
        { path: '/dashboard/settings', label: 'Ajustes', icon: <FiSettings /> }
    );

    if (user?.type === 'admin') {
        menuItems.push({ path: '/admin', label: 'Painel Admin', icon: <FiSettings style={{ color: 'red' }} /> });
    }

    return (
        <div className={styles.layout}>
            {/* Sidebar Desktop */}
            <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link to="/" className={styles.logoContainer}>
                        <img src={logoImg} alt="TopHitsBr" className={styles.logo} />
                    </Link>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item, index) => {
                        const showSeparator = item.path === '/dashboard/playlists' || item.path === '/dashboard/become-seller';

                        return (
                            <React.Fragment key={item.path}>
                                {showSeparator && <div className={styles.navSeparator} />}
                                <Link
                                    to={item.path}
                                    className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''} `}
                                    onClick={() => setMobileOpen(false)}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <span className={styles.navItemIcon}>{item.icon}</span>
                                    <span className={styles.navItemLabel}>{item.label}</span>
                                </Link>
                            </React.Fragment>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.toggleCollapse} onClick={toggleCollapse} title={isCollapsed ? "Expandir" : "Recolher"}>
                        <FiChevronLeft />
                    </button>
                    <button onClick={logout} className={`${styles.navItem} ${styles.logoutBtn} `}>
                        <span className={styles.navItemIcon}><FiLogOut /></span>
                        {!isCollapsed && <span className={styles.navItemLabel}>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <button className={styles.menuBtn} onClick={toggleMobile}>
                        <FiMenu />
                    </button>
                    <h1 className={styles.pageTitle}>Dashboard</h1>
                    <div className={styles.headerActions}>
                        <Link to="/" className={styles.siteLink}>Ir para o Site</Link>
                    </div>
                </header>

                <div className={styles.contentArea}>
                    <Routes>
                        <Route path="/" element={user?.type === 'artist' || user?.type === 'admin' ? <ProducerOverview /> : <Overview />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/purchases" element={<MyPurchases />} />
                        <Route path="/products" element={<ProducerProducts />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/financial" element={<ProducerFinance />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/reviews-producer" element={<ProducerReviews />} />
                        <Route path="/uploads" element={<MyUploads />} />
                        <Route path="/boosts" element={<MyBoosts />} />
                        <Route path="/playlists" element={<DashboardPlaylists />} />
                        <Route path="/comments" element={<DashboardComments />} />
                        <Route path="/stats" element={<DashboardStats />} />
                        <Route path="/settings" element={<DashboardSettings />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/become-seller" element={<BecomeSeller />} />
                    </Routes>
                </div>
            </main>

            <DashboardMobileNav onToggleMenu={toggleMobile} />

            {/* Overlay Mobile */}
            {mobileOpen && <div className={styles.overlay} onClick={toggleMobile}></div>}
        </div>
    );
};

export default DashboardLayout;
