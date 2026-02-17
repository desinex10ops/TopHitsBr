import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AdminLayout.module.css';
import { FiHome, FiMusic, FiStar, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiDollarSign, FiShield, FiBell, FiInfo, FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiMessageSquare, FiTrendingUp, FiDisc } from 'react-icons/fi';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/music/admin/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/music/admin/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/music/admin/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    };

    const handleNotifClick = (notif) => {
        markAsRead(notif.id);
        setShowNotifs(false);
        if (notif.link) navigate(notif.link);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type) => {
        switch (type) {
            case 'danger': return <FiAlertCircle className={`${styles.notifIcon} ${styles.notifDanger}`} />;
            case 'warning': return <FiAlertTriangle className={`${styles.notifIcon} ${styles.notifWarning}`} />;
            case 'success': return <FiCheckCircle className={`${styles.notifIcon} ${styles.notifSuccess}`} />;
            default: return <FiInfo className={`${styles.notifIcon} ${styles.notifInfo}`} />;
        }
    };

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
                    <NavLink to="/admin/albums" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiDisc /> <span>Álbuns</span>
                    </NavLink>
                    <NavLink to="/admin/highlights" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiStar /> <span>Destaques</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiUsers /> <span>Usuários</span>
                    </NavLink>
                    <NavLink to="/admin/team" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiShield /> <span>Gestão de Equipe</span>
                    </NavLink>
                    <NavLink to="/admin/credits" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiDollarSign /> <span>Créditos</span>
                    </NavLink>
                    <NavLink to="/admin/comments" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiMessageSquare /> <span>Comentários</span>
                    </NavLink>
                    <NavLink to="/admin/marketing" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiTrendingUp /> <span>Marketing</span>
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

                    <div className={styles.topRight}>
                        <div className={styles.notifWrapper}>
                            <div className={styles.bell} onClick={() => setShowNotifs(!showNotifs)}>
                                <FiBell />
                                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                            </div>

                            {showNotifs && (
                                <div className={styles.notifDropdown}>
                                    <div className={styles.notifHeader}>
                                        <h4>Notificações</h4>
                                        <button className={styles.markAllBtn} onClick={markAllRead}>Limpar todas</button>
                                    </div>
                                    <div className={styles.notifList}>
                                        {notifications.length === 0 ? (
                                            <div className={styles.notifEmpty}>Nenhuma notificação por enquanto.</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`${styles.notifItem} ${!notif.isRead ? styles.notifUnread : ''}`}
                                                    onClick={() => handleNotifClick(notif)}
                                                >
                                                    {getIcon(notif.type)}
                                                    <div className={styles.notifContent}>
                                                        <span className={styles.notifTitle}>{notif.title}</span>
                                                        <span className={styles.notifMessage}>{notif.message}</span>
                                                        <span className={styles.notifTime}>{new Date(notif.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.currentUser}>Admin User</div>
                    </div>
                </header>
                <div className={styles.contentWrapper}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
