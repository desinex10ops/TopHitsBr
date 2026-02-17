import React, { useRef } from 'react';
import styles from '../Profile.module.css';
import { FiCheck, FiCamera, FiVideo } from 'react-icons/fi';
import { getStorageUrl } from '../../../../utils/urlUtils';

const ProfileHeader = ({ user, previewAvatar, previewBanner, previewBannerVideo, onFileChange }) => {
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const bannerUrl = previewBanner || (user?.banner ? getStorageUrl(user.banner) : 'https://via.placeholder.com/1200x250/111');
    const avatarUrl = previewAvatar || (user?.avatar ? getStorageUrl(user.avatar) : 'https://via.placeholder.com/150/222');
    const hasVideo = previewBannerVideo || user?.bannerVideo;

    return (
        <header className={styles.header}>
            <div className={styles.banner}>
                {hasVideo ? (
                    <video
                        src={previewBannerVideo || getStorageUrl(user.bannerVideo)}
                        autoPlay muted loop playsInline
                        className={styles.bannerVideo}
                    />
                ) : (
                    <div className={styles.bannerImg} style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${bannerUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }} />
                )}
                <div className={styles.bannerOverlay} />

                <div style={{ position: 'absolute', bottom: 20, right: 30, display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => videoInputRef.current.click()}
                        style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                    >
                        <FiVideo /> Vídeo
                    </button>
                    <button
                        onClick={() => bannerInputRef.current.click()}
                        style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                    >
                        <FiCamera /> Imagem
                    </button>
                    <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={(e) => onFileChange(e, 'bannerVideo')} />
                    <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={(e) => onFileChange(e, 'banner')} />
                </div>
            </div>

            <div className={styles.headerContent}>
                <div className={styles.avatar}>
                    <img src={avatarUrl} alt="Avatar" />
                    <button
                        onClick={() => avatarInputRef.current.click()}
                        style={{ position: 'absolute', bottom: 5, right: 5, background: 'var(--accent-color)', border: 'none', color: '#000', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-primary)' }}
                    >
                        <FiCamera size={14} />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={(e) => onFileChange(e, 'avatar')} />
                </div>

                <div className={styles.artistInfo}>
                    <h1 className={styles.name}>
                        {user?.artisticName || user?.name}
                        {user?.isSeller && (
                            <span className={styles.sellerBadge} title="Vendedor Verificado">
                                <FiCheck size={10} /> Vendedor
                            </span>
                        )}
                    </h1>

                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>1.4K</span>
                            <span className={styles.statLabel}>Seguidores</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>85.2K</span>
                            <span className={styles.statLabel}>Plays</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>12K</span>
                            <span className={styles.statLabel}>Curtidas</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ProfileHeader;
