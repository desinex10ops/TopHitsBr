import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiDisc, FiUser } from 'react-icons/fi';
import styles from './MobileMenu.module.css';

const MobileMenu = () => {
    return (
        <nav className={styles.mobileMenu}>
            <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                <FiHome className={styles.icon} />
                <span>Início</span>
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                <FiSearch className={styles.icon} />
                <span>Buscar</span>
            </NavLink>
            <NavLink to="/genres" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                <FiDisc className={styles.icon} />
                <span>Gêneros</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                <FiUser className={styles.icon} />
                <span>Perfil</span>
            </NavLink>
        </nav>
    );
};

export default MobileMenu;
