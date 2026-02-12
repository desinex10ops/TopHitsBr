import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useRef } = React;
import { useNavigate } from 'react-router-dom';
import styles from './AlbumSlider.module.css';
import ImageWithFade from '../ImageWithFade/ImageWithFade';

const AlbumSlider = ({ albums, onAlbumClick, title }) => {
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    const scroll = (direction) => {
        if (sliderRef.current) {
            const { current } = sliderRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className={styles.sliderContainer}>
            {title && <h2 className={styles.title}>{title}</h2>}

            <button className={`${styles.navBtn} ${styles.left}`} onClick={() => scroll('left')}>
                ❮
            </button>

            <div className={styles.slider} ref={sliderRef}>
                {albums.map((item, index) => (
                    <div
                        key={`${item.id || item.album}-${index}`}
                        className={styles.slide}
                        onClick={() => onAlbumClick && onAlbumClick(item)}
                    >
                        <div className={styles.coverWrapper}>
                            {item.coverpath || item.cover ? (
                                <ImageWithFade src={getStorageUrl(item.coverpath || item.cover)} alt={item.title || item.album} className={styles.cover} />
                            ) : (
                                <div className={styles.placeholder}>💿</div>
                            )}
                            <div className={styles.revealOverlay}>
                                <span>{item.title ? 'Ouvir' : 'Ver Músicas'}</span>
                            </div>
                        </div>
                        <div className={styles.info}>
                            <strong className={styles.albumTitle}>{item.title || item.album}</strong>
                            <span
                                className={styles.artistName}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.UserId) {
                                        navigate(`/artist/${item.UserId}`);
                                    }
                                }}
                                style={{
                                    cursor: item.UserId ? 'pointer' : 'default'
                                }}
                                title={item.UserId ? "Ver Perfil do Artista" : ""}
                            >
                                {item.artist}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button className={`${styles.navBtn} ${styles.right}`} onClick={() => scroll('right')}>
                ❯
            </button>
        </div>
    );
};

export default AlbumSlider;
