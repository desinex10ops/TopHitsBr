import { getStorageUrl } from '../../utils/urlUtils';
import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './TopCDs.module.css';

import { Link } from 'react-router-dom';

const RankedAlbumCard = ({ album, rank }) => {
    // Generate valid ID
    const linkTo = album.AlbumId
        ? `/album/${album.AlbumId}`
        : `/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.album || album.title)}`;

    return (
        <Link to={linkTo} className={styles.card} style={{ textDecoration: 'none' }}>
            <div className={styles.coverWrapper}>
                <div className={styles.rankBadge}>{rank}</div>
                <img
                    src={getStorageUrl(album.cover) || getStorageUrl('covers/default_cover.jpg')}
                    alt={album.title}
                    className={styles.cover}
                    crossOrigin="anonymous"
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
        </Link>
    );
};

export default RankedAlbumCard;
