import * as React from 'react';
const { useState } = React;
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiMusic, FiStar, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiDollarSign, FiShield } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={styles.adminContainer}>
            {/* Admin Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
                <div className={styles.logoContainer}>
                    <h1 className={styles.logo}>THBR <span>Admin</span></h1>
                    <button className={styles.closeBtn} onClick={toggleSidebar}><FiX /></button>
                </div>

                <nav className={styles.nav}>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiHome /> <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/tracks" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiMusic /> <span>Músicas & Karaokê</span>
                    </NavLink>
                    <NavLink to="/admin/highlights" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiStar /> <span>Destaques</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiUsers /> <span>Usuários</span>
                    </NavLink>
                    <NavLink to="/admin/credits" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiDollarSign /> <span>Créditos</span>
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiSettings /> <span>Configurações</span>
                    </NavLink>
                    <NavLink to="/admin/piracy-logs" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiShield /> <span>Logs de Segurança</span>
                    </NavLink>
                </nav>

                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <FiLogOut /> <span>Sair</span>
                    </button>
                    <NavLink to="/" className={styles.backLink}>Voltar para o Site</NavLink>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <header className={styles.topbar}>
                    <button className={styles.toggleBtn} onClick={toggleSidebar}>
                        <FiMenu />
                    </button>
                    <div className={styles.currentUser}>Admin User</div>
                </header>
                <div className={styles.contentWrapper}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
