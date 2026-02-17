import { useNavigate } from 'react-router-dom';

const MarketplaceBanner = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.bannerContainer}>
            {/* Background Image Layer */}
            <div className={styles.bannerBackground}></div>

            <div className={styles.overlay}></div>

            <div className={styles.bannerContent}>
                <div className={styles.textContent}>
                    <div className={styles.badge}>NOVIDADE</div>
                    <h1 className={styles.title}>GANHE DINHEIRO</h1>
                    <h2 className={styles.subtitle}>
                        Transforme suas playlists em renda. Venda seus packs musicais.
                    </h2>

                    <div className={styles.benefits}>
                        <div className={styles.benefitItem}>
                            <div className={styles.iconCircle}><FiMusic /></div>
                            <span>Todos ouvem grátis</span>
                        </div>
                        <div className={styles.benefitItem}>
                            <div className={styles.iconCircle}><FiDownload /></div>
                            <span>Download só pagando</span>
                        </div>
                        <div className={styles.benefitItem}>
                            <div className={styles.iconCircle}><FiDollarSign /></div>
                            <span>Você lucra</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => navigate('/dashboard/producer')}
                        >
                            VENDER MEU PACK
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => navigate('/shop')}
                        >
                            EXPLORAR PACKS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceBanner;
