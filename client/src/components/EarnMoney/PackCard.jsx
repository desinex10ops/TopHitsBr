import * as React from 'react';
import { FiPlay, FiLock, FiStar } from 'react-icons/fi';
import styles from './EarnMoney.module.css';

const PackCard = ({ pack }) => {
    return (
        <div className={styles.packCard}>
            <div className={styles.packCoverWrapper}>
                <img src={pack.cover} alt={pack.title} className={styles.packCover} />
                <div className={styles.packOverlay}>
                    <button className={styles.previewBtn} title="Ouvir Prévias">
                        <FiPlay />
                    </button>
                </div>
                <div className={styles.priceTag}>R$ {pack.price}</div>
            </div>

            <div className={styles.packInfo}>
                <h3 className={styles.packTitle}>{pack.title}</h3>
                <p className={styles.packCreator}>por {pack.creator}</p>

                <div className={styles.packRating}>
                    {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={i < pack.rating ? styles.starFilled : styles.starEmpty} />
                    ))}
                    <span className={styles.downloadCount}>({pack.downloads})</span>
                </div>

                <button className={styles.buyBtn}>
                    <FiLock /> Comprar agora
                </button>
            </div>
        </div>
    );
};

export default PackCard;
