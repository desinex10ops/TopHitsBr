import * as React from 'react';
const { useState, useEffect } = React;
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './ArtistProfile.module.css';
import { FiPlay, FiUserPlus, FiCheck } from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';
import { getStorageUrl } from '../../utils/urlUtils';

const ArtistProfile = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const { playTrack, setPlaylist } = usePlayer();

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                setLoading(true);
                const [artistRes, albumsRes] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/music/artist/${id}/albums`) // Assuming this endpoint exists
                ]);
                setArtist(artistRes.data);
                setAlbums(albumsRes.data);
            } catch (error) {
                console.error("Erro ao carregar artista:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [id]);

    const handlePlayAll = () => {
        // Collect all tracks from all albums (simplified)
        // ideally we would hit an endpoint to get top tracks
        if (!albums.length) return;

        let allTracks = [];
        albums.forEach(a => {
            if (a.Tracks) {
                allTracks = [...allTracks, ...a.Tracks.map(t => ({ ...t, album: a.title, coverpath: a.cover, artist: artist.artisticName }))];
            }
        });

        if (allTracks.length > 0) {
            setPlaylist(allTracks);
            playTrack(allTracks[0]);
        }
    };

    const toggleFollow = () => {
        setFollowing(!following);
        // Call API to follow/unfollow
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (!artist) return <div className={styles.error}>Artista não encontrado.</div>;

    const bannerUrl = artist.banner ? getStorageUrl(artist.banner) : null;
    const avatarUrl = artist.avatar ? getStorageUrl(artist.avatar) : '/default-avatar.png';

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none', backgroundColor: '#333' }}>
                <div className={styles.headerContent}>
                    <h1 className={styles.name}>{artist.artisticName}</h1>
                    <p className={styles.stats}>125.4k Ouvintes mensais</p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.controls}>
                    <button className={styles.playBtn} onClick={handlePlayAll}>
                        <FiPlay fill="currentColor" />
                    </button>
                    <button className={`${styles.followBtn} ${following ? styles.following : ''}`} onClick={toggleFollow}>
                        {following ? 'SEGUINDO' : 'SEGUIR'}
                    </button>
                </div>

                <div className={styles.section}>
                    <h3>Álbuns</h3>
                    <div className={styles.grid}>
                        {albums.map(album => (
                            <Link to={`/album/${album.id}`} key={album.id} className={styles.card}>
                                <img src={getStorageUrl(album.cover)} alt={album.title} />
                                <div className={styles.cardInfo}>
                                    <h4>{album.title}</h4>
                                    <p>{album.year}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Sobre</h3>
                    <div className={styles.about}>
                        {artist.bio || "Sem biografia."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistProfile;
