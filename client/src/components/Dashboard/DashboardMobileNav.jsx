import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiDollarSign, FiMenu, FiList, FiHeart, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import styles from './DashboardMobileNav.module.css';
import { getStorageUrl } from '@/utils/urlUtils';

const DashboardMobileNav = ({ onToggleMenu }) => {
    const { user } = useAuth();
    const isProducer = user?.type === 'artist' || user?.type === 'admin';

    return (
        <nav className={styles.mobileNav}>
            <NavLink
                to="/dashboard"
                end
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <FiHome />
                <span>Início</span>
            </NavLink>

            {isProducer ? (
                <>
                    <NavLink
                        to="/dashboard/products"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <FiShoppingBag />
                        <span>Produtos</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/financial"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <FiDollarSign />
                        <span>Financeiro</span>
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink
                        to="/dashboard/playlists"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <FiList />
                        <span>Playlists</span>
                    </NavLink>

                    <NavLink
                        to="/liked-songs"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <FiHeart />
                        <span>Curtidas</span>
                    </NavLink>
                </>
            )}

            <button onClick={onToggleMenu} className={styles.navItem}>
                {user?.avatar ? (
                    <img src={getStorageUrl(user.avatar)} alt="Menu" className={styles.avatarIcon} />
                ) : (
                    <FiMenu />
                )}
                <span>Menu</span>
            </button>
        </nav>
    );
};

export default DashboardMobileNav;
