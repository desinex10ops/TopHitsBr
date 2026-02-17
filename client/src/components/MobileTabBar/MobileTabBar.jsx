import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiDisc, FiUser, FiList, FiHeart } from 'react-icons/fi';
import styles from './MobileTabBar.module.css';

const MobileTabBar = () => {
    return (
        <nav className={styles.tabBar}>
            <NavLink to="/" className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.active}` : styles.tabItem}>
                <div className={styles.iconWrapper}>
                    <FiHome />
                </div>
                <span className={styles.label}>Início</span>
            </NavLink>

            <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.active}` : styles.tabItem}>
                <div className={styles.iconWrapper}>
                    <FiSearch />
                </div>
                <span className={styles.label}>Buscar</span>
            </NavLink>

            <NavLink to="/liked-songs" className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.active}` : styles.tabItem}>
                <div className={styles.iconWrapper}>
                    <FiHeart />
                </div>
                <span className={styles.label}>Curtidas</span>
            </NavLink>

            <NavLink to="/playlists" className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.active}` : styles.tabItem}>
                <div className={styles.iconWrapper}>
                    <FiList />
                </div>
                <span className={styles.label}>Biblio</span>
            </NavLink>
        </nav>
    );
};

export default MobileTabBar;
