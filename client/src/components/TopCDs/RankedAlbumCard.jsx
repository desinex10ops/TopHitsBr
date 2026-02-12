import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './TopCDs.module.css';

const RankedAlbumCard = ({ album, rank }) => {
    return (
        <div className={styles.card}>
            <div className={styles.coverWrapper}>
                <div className={styles.rankBadge}>{rank}</div>
                <img
                    src={getStorageUrl(album.cover) || getStorageUrl('covers/default_cover.jpg')}
                    alt={album.title}
                    className={styles.cover}
                />
            </div>

            <div className={styles.info}>
                <h3 className={styles.title} title={album.title}>
                    {album.title}
                </h3>

                <div className={styles.artistRow}>
                    <span className={styles.artistName}>{album.artist}</span>
                    <FiCheckCircle className={styles.verifiedIcon} />
                </div>

                <div className={styles.statsRow}>
                    <span className={styles.statHighlight}>{album.plays || 0}M</span>
                    <span className={styles.statLabel}> | TOTAL {album.downloads || 0}M</span>
                </div>
            </div>
        </div>
    );
};

export default RankedAlbumCard;
