import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiTwitter } from 'react-icons/fi';
import { FaTiktok, FaGooglePlay, FaApple } from 'react-icons/fa'; // Using Fa for brands
import styles from './Footer.module.css';
import api from '../../services/api';
import logo from '../../assets/logo_tophits.png'; // Import Logo

const Footer = () => {
    const [footerData, setFooterData] = useState(null);

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const res = await api.get('/music/settings');
                // The API returns all settings. We need 'site_footer' specifically.
                // However, the current endpoint returns an object with keys.
                // Let's assume site_footer is passed as a JSON string if stored in SystemSetting, 
                // OR checking previous AdminSettings logic, it seems it returns object with keys like banner_title.
                // If site_footer isn't set yet, we use a default.

                let data = null;
                if (res.data.site_footer) {
                    try {
                        data = typeof res.data.site_footer === 'string'
                            ? JSON.parse(res.data.site_footer)
                            : res.data.site_footer;
                    } catch (e) {
                        console.error("Error parsing footer data", e);
                    }
                }

                if (!data) {
                    // Default Structure if DB is empty
                    data = {
                        columns: [
                            {
                                title: "Central de Ajuda",
                                links: [
                                    { label: "Baixando músicas", url: "/help/download" },
                                    { label: "Cadastro e Login", url: "/help/login" },
                                    { label: "Termos de Uso", url: "/terms" },
                                    { label: "Política de Privacidade", url: "/privacy" }
                                ]
                            },
                            {
                                title: "Sua Música",
                                links: [
                                    { label: "Sobre", url: "/about" },
                                    { label: "Carreiras", url: "/careers" },
                                    { label: "Contato", url: "/contact" },
                                    { label: "Anuncie", url: "/advertise" }
                                ]
                            }
                        ],
                        socials: {
                            instagram: "https://instagram.com",
                            facebook: "https://facebook.com",
                            youtube: "https://youtube.com",
                            tiktok: "https://tiktok.com",
                            twitter: "https://twitter.com"
                        },
                        apps: {
                            android: "#",
                            ios: "#"
                        },
                        text: "O TopHitsBr é a maior plataforma de entretenimento focada em música regional do Brasil, onde artistas independentes disponibilizam grátis seus conteúdos aos fãs.",
                        copy: "© 2026 TopHitsBr. Fácil de ouvir, rápido para baixar."
                    };
                }
                setFooterData(data);
            } catch (error) {
                console.error("Erro ao carregar rodapé:", error);
            }
        };

        fetchFooter();
    }, []);

    if (!footerData) return null;

    try {
        return (
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.topSection}>
                        {/* Brand Column */}
                        <div className={styles.brandColumn}>
                            <img src={logo} alt="TopHitsBr" className={styles.logo} />
                            <p className={styles.description}>
                                {footerData.text}
                            </p>
                            <div className={styles.socials}>
                                {footerData.socials?.instagram && (
                                    <a href={footerData.socials.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FiInstagram /></a>
                                )}
                                {footerData.socials?.facebook && (
                                    <a href={footerData.socials.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FiFacebook /></a>
                                )}
                                {footerData.socials?.youtube && (
                                    <a href={footerData.socials.youtube} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FiYoutube /></a>
                                )}
                                {footerData.socials?.tiktok && (
                                    <a href={footerData.socials.tiktok} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaTiktok /></a>
                                )}
                                {footerData.socials?.twitter && (
                                    <a href={footerData.socials.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FiTwitter /></a>
                                )}
                            </div>
                        </div>

                        {/* Navigation Links Grid */}
                        <div className={styles.linksGrid}>
                            {footerData.columns && Array.isArray(footerData.columns) && footerData.columns.map((col, index) => (
                                <div key={index} className={styles.column}>
                                    <h3>{col.title}</h3>
                                    <ul>
                                        {col.links && Array.isArray(col.links) && col.links.map((link, i) => (
                                            <li key={i}>
                                                <Link to={link.url || '#'}>{link.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Apps Column */}
                        <div className={styles.appsColumn}>
                            <h3>Baixe nosso App</h3>
                            <div className={styles.apps}>
                                {footerData.apps?.android && (
                                    <a href={footerData.apps.android} className={styles.appBtn}>
                                        <FaGooglePlay className={styles.appIcon} />
                                        <div className={styles.appText}>
                                            <span>Disponível no</span>
                                            <strong>Google Play</strong>
                                        </div>
                                    </a>
                                )}
                                {footerData.apps?.ios && (
                                    <a href={footerData.apps.ios} className={styles.appBtn}>
                                        <FaApple className={styles.appIcon} />
                                        <div className={styles.appText}>
                                            <span>Baixar na</span>
                                            <strong>App Store</strong>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.bottomBar}>
                        <div className={styles.copyright}>
                            {footerData.copy}
                        </div>
                        <div className={styles.legalLinks}>
                            <Link to="/privacy">Privacidade</Link>
                            <Link to="/terms">Termos</Link>
                            <Link to="/cookies">Cookies</Link>
                        </div>
                    </div>
                </div>
            </footer>
        );
    } catch (error) {
        console.error("Footer rendering error:", error);
        return null; // Fallback to nothing if footer fails
    }
};

export default Footer;
