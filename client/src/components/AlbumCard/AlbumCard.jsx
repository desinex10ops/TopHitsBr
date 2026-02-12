import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
import styles from './AlbumCard.module.css';
import ImageWithFade from '../ImageWithFade/ImageWithFade';
import { useNavigate } from 'react-router-dom';

const AlbumCard = ({ album }) => {
    const navigate = useNavigate();

    // Removed getCoverUrl function

    const handleClick = () => {
        navigate(`/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.album)}`);
    };

    return (
        <div className={styles.card} onClick={handleClick}>
            <div className={styles.coverWrapper}>
                {album.coverpath ? (
                    <ImageWithFade src={getStorageUrl(album.coverpath)} alt={album.album} className={styles.cover} />
                ) : (
                    <div className={styles.placeholder}>💿</div>
                )}
                <div className={styles.overlay}>
                    <span>Ver Álbum</span>
                </div>
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>{album.album || album.title}</h3>
                <p
                    className={styles.artist}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Support both casing conventions or fallback
                        const artistId = album.UserId || album.artistId || album.user_id;
                        if (artistId) {
                            navigate(`/artist/${artistId}`);
                        } else {
                            console.warn("Artist ID missing for navigation", album);
                        }
                    }}
                    title="Ver Perfil do Artista"
                    style={{ cursor: 'pointer' }}
                >
                    {album.artist}
                </p>

                {/* Action Buttons Row */}
                <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
                    <button
                        className={styles.actionBtn}
                        title="Adicionar à Playlist"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Trigger playlist add (mock for now or invoke context)
                            alert("Adicionar à playlist: " + (album.album || album.title));
                        }}
                    >
                        ➕ Playlist
                    </button>
                    <button
                        className={styles.actionBtn}
                        title="Ir para o Artista"
                        onClick={(e) => {
                            e.stopPropagation();
                            const artistId = album.UserId || album.artistId || album.user_id;
                            if (artistId) navigate(`/artist/${artistId}`);
                        }}
                    >
                        👤 Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlbumCard;
