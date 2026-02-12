import * as React from 'react';
const { useState } = React;
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

// Ícones
import { FiHome, FiUser, FiMusic, FiList, FiMessageSquare, FiBarChart2, FiSettings, FiLogOut, FiMenu, FiX, FiTrendingUp, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

import Overview from './Overview';
import Profile from './Profile';
import MyUploads from './MyUploads';
import MyBoosts from './MyBoosts';
import DashboardPlaylists from './DashboardPlaylists';
import DashboardComments from './DashboardComments';
import DashboardStats from './DashboardStats';
import DashboardSettings from './DashboardSettings';
import Wallet from '../Wallet/Wallet';
import MyProducts from './Producer/MyProducts';
import Orders from './Producer/Orders';
import Financial from './Producer/Financial';
import Marketing from './Producer/Marketing';
import MyPurchases from './Purchases/MyPurchases'; // Added

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = () => setMobileOpen(!mobileOpen);

    const menuItems = [
        { path: '/dashboard', label: 'Visão Geral', icon: <FiHome /> },
        { path: '/dashboard/profile', label: 'Meu Perfil', icon: <FiUser /> },
        { path: '/dashboard/purchases', label: 'Minhas Compras', icon: <FiShoppingBag /> }, // Added
    ];

    if (user?.type === 'artist' || user?.type === 'admin') {
        menuItems.push(
            { path: '/dashboard/products', label: 'Meus Produtos', icon: <FiShoppingBag /> },
            { path: '/dashboard/orders', label: 'Pedidos', icon: <FiList /> },
            { path: '/dashboard/financial', label: 'Financeiro', icon: <FiDollarSign /> },
            { path: '/dashboard/marketing', label: 'Marketing', icon: <FiTrendingUp /> }
        );
    }

    menuItems.push(
        { path: '/dashboard/playlists', label: 'Playlists', icon: <FiList /> },
        { path: '/dashboard/comments', label: 'Comentários', icon: <FiMessageSquare /> },
        { path: '/dashboard/stats', label: 'Estatísticas', icon: <FiBarChart2 /> },
        { path: '/dashboard/settings', label: 'Configurações', icon: <FiSettings /> }
    );

    if (user?.type === 'admin') {
        menuItems.push({ path: '/admin', label: 'Painel Admin', icon: <FiSettings style={{ color: 'red' }} /> });
    }

    return (
        <div className={styles.layout}>
            {/* Sidebar Desktop */}
            <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''} `}>
                <div className={styles.sidebarHeader}>
                    <span className={styles.logo}>TopHitsBR</span>
                    <button className={styles.closeBtn} onClick={toggleMobile}><FiX /></button>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : <FiUser />}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.name}>{user?.name}</span>
                        <span className={styles.role}>
                            {user?.type === 'admin' ? 'Administrador' : (user?.type === 'artist' ? 'Artista' : 'Ouvinte')}
                        </span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''} `}
                            onClick={() => setMobileOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button onClick={logout} className={`${styles.navItem} ${styles.logoutBtn} `}>
                        <FiLogOut />
                        <span>Sair</span>
                    </button>
                </nav>
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
                        <Route path="/" element={<Overview />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/purchases" element={<MyPurchases />} /> {/* Added */}
                        <Route path="/products" element={<MyProducts />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/financial" element={<Financial />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/uploads" element={<MyUploads />} />
                        <Route path="/boosts" element={<MyBoosts />} />
                        <Route path="/playlists" element={<DashboardPlaylists />} />
                        <Route path="/comments" element={<DashboardComments />} />
                        <Route path="/stats" element={<DashboardStats />} />
                        <Route path="/settings" element={<DashboardSettings />} />
                        <Route path="/wallet" element={<Wallet />} />
                    </Routes>
                </div>
            </main>

            {/* Overlay Mobile */}
            {mobileOpen && <div className={styles.overlay} onClick={toggleMobile}></div>}
        </div>
    );
};

export default DashboardLayout;
