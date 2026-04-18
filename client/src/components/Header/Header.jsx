import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import styles from './Header.module.css';
import {
    FiHome, FiCompass, FiTrendingUp, FiList, FiSave, FiUpload,
    FiBell, FiUser, FiLogOut, FiSettings, FiDownload, FiSearch,
    FiPlay, FiPause, FiSkipForward, FiSkipBack, FiX, FiShoppingCart, FiGrid
} from 'react-icons/fi';

import NotificationBell from '../Notifications/NotificationBell';
import { useNotifications } from '@/contexts/NotificationContext';
import { getStorageUrl } from '@/utils/urlUtils';

const Header = () => {
    const { pendriveItems } = usePlayer();
    const { user, logout } = useAuth();
    const { cart } = useCart();
    // const { unreadCount } = useNotifications(); // Handled inside NotificationBell now
    const [searchTerm, setSearchTerm] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = useRef(null);

    // Sticky Header Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleUploadClick = (e) => {
        if (!user) {
            e.preventDefault();
            if (window.confirm("Faça login ou cadastre-se para enviar músicas!")) {
                navigate('/login');
            }
        }
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                {/* LEFT: Logo & Nav */}
                <div className={styles.leftSection}>
                    <nav className={styles.mainNav}>
                        <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} title="Início">
                            <FiHome /> <span className={styles.linkText}>Início</span>
                        </NavLink>
                        <NavLink to="/genres" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} title="Explorar">
                            <FiCompass /> <span className={styles.linkText}>Explorar</span>
                        </NavLink>
                    </nav>
                </div>

                {/* CENTER: Search */}
                <div className={styles.centerSection}>
                    <form className={styles.searchBar} onSubmit={handleSearch}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="O que você quer ouvir hoje?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>

                {/* RIGHT: Actions, Player, Profile */}
                <div className={styles.rightSection}>
                    {/* Mini Player (Desktop) */}


                    <div className={styles.actions}>
                        {/* CONDITIONAL CART ICON */}
                        {location.pathname.startsWith('/shop') && (
                            <Link to="/cart" className={styles.actionBtn} title="Carrinho">
                                <FiShoppingCart />
                                {cart.length > 0 && <span className={styles.badge}>{cart.length}</span>}
                            </Link>
                        )}

                        {/* NOTIFICATION BELL */}
                        {user && <NotificationBell />}

                        <Link to="/upload" className={styles.actionBtn} onClick={handleUploadClick} title="Upload">
                            <FiUpload />
                            <span className={styles.actionLabel}>Upload</span>
                        </Link>

                        <Link to="/pen-drive" className={styles.actionBtn} title="Meu Pen Drive">
                            <FiSave />
                            {pendriveItems.length > 0 && <span className={styles.badge}>{pendriveItems.length}</span>}
                        </Link>

                        {user && (
                            <Link to="/dashboard" className={styles.actionBtn} title="Dashboard">
                                <FiGrid />
                                <span className={styles.actionLabel}>Dashboard</span>
                            </Link>
                        )}

                        {/* Profile Dropdown */}
                        <div className={styles.profileWrapper} ref={profileRef}>
                            <div
                                className={styles.avatar}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                {user && user.avatar ? <img src={getStorageUrl(user.avatar)} alt="Avatar" /> : <FiUser />}
                            </div>

                            {showProfileMenu && (
                                <div className={styles.dropdown}>
                                    {user ? (
                                        <>
                                            <div className={styles.dropdownHeader}>
                                                <strong>{user.name || "Usuário"}</strong>
                                                <span>{user.email}</span>
                                            </div>
                                            <div className={styles.dropdownDivider}></div>
                                            <Link to="/dashboard/profile" className={styles.dropdownItem}><FiUser /> Meu Perfil</Link>
                                            <Link to="/dashboard/playlists" className={styles.dropdownItem}><FiList /> Minhas Playlists</Link>
                                            <Link to="/pen-drive" className={styles.dropdownItem}><FiSave /> Meu Pen Drive</Link>
                                            <div className={styles.dropdownDivider}></div>
                                            <Link to="/dashboard/settings" className={styles.dropdownItem}><FiSettings /> Configurações</Link>
                                            <button onClick={logout} className={`${styles.dropdownItem} ${styles.logoutBtn}`}>
                                                <FiLogOut /> Sair
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.dropdownHeader}>
                                                <strong>Visitante</strong>
                                            </div>
                                            <div className={styles.dropdownDivider}></div>
                                            <Link to="/login" className={styles.dropdownItem}>Entrar</Link>
                                            <Link to="/register" className={styles.dropdownItem}>Criar conta</Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
