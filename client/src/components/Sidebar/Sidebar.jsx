import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiHome, FiSearch, FiDisc, FiPlusSquare, FiHeart, FiUser, FiLogIn, FiMusic, FiCreditCard, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Sidebar.module.css';
import api from '../../services/api';
import { useToast } from '@/contexts/ToastContext';
import logoImg from '../../assets/logo_tophits.png';



const Sidebar = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [playlists, setPlaylists] = useState([]);

    // Simple inline creation for now to match Sidebar flow
    const handleCreatePlaylist = async () => {
        const name = prompt("Nome da nova playlist:");
        if (!name) return;

        try {
            const response = await api.post('/music/playlists', { name });
            setPlaylists([response.data, ...playlists]);
            addToast("Playlist criada!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao criar playlist.", "error");
        }
    };

    useEffect(() => {
        if (user) {
            api.get('/music/playlists/user')
                .then(res => setPlaylists(res.data))
                .catch(err => console.error("Erro ao carregar playlists sidebar:", err));
        }
    }, [user]);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Link to="/">
                    <img src={logoImg} alt="TopHitsBR" className={styles.logo} />
                </Link>
            </div>

            <nav className={styles.nav}>
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
                <NavLink to="/shop" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} style={{ color: '#1db954' }}>
                    <FiShoppingBag className={styles.icon} />
                    <span>SHOP</span>
                </NavLink>
                {user && (
                    <NavLink to="/wallet" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <FiCreditCard className={styles.icon} />
                        <span>Carteira</span>
                    </NavLink>
                )}

                {/* Links para Produtores */}
                {user && (user.type === 'artist' || user.type === 'admin') && (
                    <>
                        <div className={styles.divider}></div>
                        <div className={styles.sectionTitle}>ÁREA DO PRODUTOR</div>
                        <NavLink to="/dashboard/products" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                            <FiDisc className={styles.icon} />
                            <span>Meus Produtos</span>
                        </NavLink>
                        <NavLink to="/dashboard/finance" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                            <FiDollarSign className={styles.icon} />
                            <span>Financeiro</span>
                        </NavLink>
                        <NavLink to="/dashboard/marketing" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                            <FiTrendingUp className={styles.icon} />
                            <span>Marketing</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className={styles.librarySection}>
                <div className={styles.sectionTitle}>SUA BIBLIOTECA</div>
                <button className={styles.navItem} onClick={handleCreatePlaylist}>
                    <FiPlusSquare className={styles.icon} />
                    <span>Criar Playlist</span>
                </button>
                <NavLink to="/liked-songs" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    <FiHeart className={styles.icon} />
                    <span>Músicas Curtidas</span>
                </NavLink>

                <NavLink to="/karaoke" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    <span className={styles.icon} style={{ fontSize: '1.2rem' }}>🎤</span>
                    <span>Karaokê</span>
                    <span className={styles.badgeNew}>NOVO</span>
                </NavLink>

                <div className={styles.divider} style={{ margin: '10px 0' }}></div>

                {/* User Playlists List */}
                <div className={styles.playlistList}>
                    {playlists.map(pl => (
                        <NavLink
                            key={pl.id}
                            to={`/playlist/${pl.id}`}
                            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                            style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                        >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {pl.name}
                            </span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className={styles.footerNav}>
                {user ? (
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            {user.avatar ? <img src={user.avatar} alt={user.name} /> : <FiUser />}
                        </div>
                        <span className={styles.userName}>{user.name}</span>
                    </div>
                ) : (
                    <div className={styles.authButtons}>
                        <Link to="/register" className={styles.signupBtn}>Inscrever-se</Link>
                        <Link to="/login" className={styles.loginBtn}>Entrar</Link>
                    </div>
                )}

                <Link to="/admin" className={styles.adminLink}>Admin</Link>
            </div>
        </aside>
    );
};

export default Sidebar;
