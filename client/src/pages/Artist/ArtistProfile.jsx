import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './ArtistProfile.module.css';
import { FiPlay, FiUserPlus, FiCheck, FiMessageSquare, FiInstagram, FiSmartphone } from 'react-icons/fi';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { getStorageUrl } from '../../utils/urlUtils';
import { toast } from 'react-toastify';
import ChatModal from '../Dashboard/Chat/ChatModal';

const ArtistProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [artist, setArtist] = useState(null);
    const [popular, setPopular] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [singles, setSingles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const { playTrack, setPlaylist } = usePlayer();

    const [relatedArtists, setRelatedArtists] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/music/artist/${id}`);
                const data = response.data;

                setArtist(data.artist);
                setPopular(data.popular || []);
                setAlbums(data.albums || []);
                setSingles(data.singles || []);
                setRelatedArtists(data.relatedArtists || []);
                setGallery(data.gallery || []); // Set gallery
            } catch (error) {
                console.error("Erro ao carregar artista:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [id]);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    };

    // ... existing functions ...


    const handlePlayAll = () => {
        // Collect all tracks from all albums (simplified)
        // ideally we would hit an endpoint to get top tracks
        if (!albums.length) return;

        let allTracks = [];
        albums.forEach(a => {
            const albumTracks = a.Tracks || a.tracks;
            if (albumTracks) {
                allTracks = [...allTracks, ...albumTracks.map(t => ({
                    ...t,
                    album: a.name || a.title,
                    coverpath: a.cover,
                    artist: artist.artisticName
                }))];
            }
        });

        // Also add singles
        if (singles.length > 0) {
            allTracks = [...allTracks, ...singles.map(s => ({ ...s, artist: artist.artisticName }))];
        }

        if (allTracks.length > 0) {
            setPlaylist(allTracks);
            playTrack(allTracks[0]);
        }
    };

    const toggleFollow = () => {
        setFollowing(!following);
        // Call API to follow/unfollow
    };

    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleSendMessage = () => {
        if (!user) {
            toast.error("Você precisa estar logado para enviar mensagens.");
            return;
        }
        setIsChatOpen(true);
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (!artist) return <div className={styles.error}>Artista não encontrado.</div>;

    const bannerUrl = artist.banner ? getStorageUrl(artist.banner) : null;
    const avatarUrl = artist.avatar ? getStorageUrl(artist.avatar) : '/default-avatar.png';

    // Format numbers
    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    };

    // Generate accent color based on artist ID (simple hash)
    const getAccentColor = (id) => {
        const colors = [
            '#535353', '#7e2020', '#203e7e', '#207e4e', '#7e2d7e', '#7e6c20',
            '#e91429', '#1db954', '#f59b23', '#b91d88'
        ];
        if (!id) return colors[0];
        const hash = id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const accentColor = getAccentColor(artist.id);

    return (
        <div className={styles.container} style={{ '--artist-color': accentColor }}>
            <div className={styles.header}>
                <div
                    className={styles.headerBackground}
                    style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none' }}
                />

                <div className={styles.headerContent}>
                    <div className={styles.avatarWrapper}>
                        <img src={avatarUrl} alt={artist.artisticName} className={styles.avatar} />
                    </div>
                    <div className={styles.artistInfo}>
                        <div className={styles.verifiedBadge}>
                            <FiCheck /> <span>Artista Verificado</span>
                        </div>
                        <h1 className={styles.artistName}>{artist.artisticName}</h1>
                        <div className={styles.stats}>
                            <span>{formatNumber(artist.stats?.plays)} Plays</span>
                            <span className={styles.dot}></span>
                            <span>{formatNumber(artist.stats?.followers)} Seguidores</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {/* Dynamic Gradient Overlay */}
                <div className={styles.gradientBackground} />

                <div className={styles.actions}>
                    <button className={styles.playBtn} onClick={handlePlayAll}>
                        <FiPlay fill="currentColor" />
                    </button>
                    <button className={`${styles.followBtn} ${following ? styles.following : ''}`} onClick={toggleFollow}>
                        {following ? 'SEGUINDO' : 'SEGUIR'}
                    </button>
                    {user && user.id !== artist.id && (
                        <button className={styles.messageBtn} onClick={handleSendMessage} title="Enviar Mensagem">
                            <FiMessageSquare />
                        </button>
                    )}

                    {artist.instagram && (
                        <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} title="Instagram">
                            <FiInstagram />
                        </a>
                    )}

                    {artist.whatsapp && (
                        <a href={`https://wa.me/${artist.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} title="WhatsApp">
                            <FiSmartphone />
                        </a>
                    )}
                </div>

                {/* Related Artists Section */}
                {relatedArtists && relatedArtists.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Fãs também curtem</h3>
                        <div className={styles.relatedList}>
                            {relatedArtists.map(related => (
                                <Link to={`/artist/${related.id}`} key={related.id} className={styles.relatedItem}>
                                    {related.avatar && (
                                        <img
                                            src={getStorageUrl(related.avatar)}
                                            alt={related.artisticName}
                                            className={styles.relatedAvatar}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    )}
                                    <div
                                        className={styles.relatedAvatarPlaceholder}
                                        style={{ display: related.avatar ? 'none' : 'flex' }}
                                    >
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF' }}>
                                            {related.artisticName?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className={styles.relatedName}>{related.artisticName}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}


                {/* Popular Tracks Section if exists */}
                {popular && popular.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Populares</h3>
                        <div className={styles.popularList}>
                            {popular.map((track, idx) => (
                                <div key={track.id} className={styles.popularRow} onClick={() => playTrack(track)}>
                                    <span className={styles.popularIndex}>{idx + 1}</span>
                                    <div className={styles.popularInfo}>
                                        <img src={getStorageUrl(track.coverpath)} alt={track.title} className={styles.popularThumb} />
                                        <span className={styles.popularTitle}>{track.title}</span>
                                    </div>
                                    <span className={styles.popularPlays}>{track.plays?.toLocaleString() || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Discografia</h3>
                    {albums.length > 0 ? (
                        <div className={styles.grid}>
                            {albums.map((album, idx) => (
                                <Link
                                    to={`/album/${album.id}`}
                                    key={album.id || idx}
                                    className={styles.card}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        <img src={getStorageUrl(album.cover)} alt={album.title} className={styles.cardImage} />
                                        {/* Play Overlay */}
                                        <div className={styles.cardPlayOverlay}>
                                            <FiPlay fill="currentColor" />
                                        </div>
                                    </div>
                                    <h4 className={styles.cardTitle}>{album.title || album.name || "Sem Título"}</h4>
                                    <p className={styles.cardSubtitle}>{album.year || '----'}</p>
                                </Link>
                            ))}
                        </div>
                    ) : !singles.length ? (
                        <p style={{ color: '#aaa' }}>Nenhum lançamento encontrado.</p>
                    ) : null}
                </div>

                {singles.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Singles e EPs</h3>
                        <div className={styles.scrollableList}>
                            {singles.map((single, idx) => (
                                <div key={idx} className={styles.popularRow} onClick={() => playTrack(single)}>
                                    <span className={styles.popularIndex}>{idx + 1}</span>
                                    <div className={styles.popularInfo}>
                                        <img src={getStorageUrl(single.coverpath)} alt={single.title} className={styles.popularThumb} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className={styles.popularTitle}>{single.title}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#b3b3b3' }}>Single • {new Date(single.createdAt).getFullYear()}</span>
                                        </div>
                                    </div>
                                    <span className={styles.popularPlays}>{single.plays?.toLocaleString() || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Sobre</h3>
                    <div className={styles.about}>
                        {artist.bio || "Sem biografia."}
                    </div>
                </div>

                {/* Gallery Section */}
                {gallery.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Galeria</h3>
                        <div className={styles.galleryGrid}>
                            {gallery.map((img, idx) => (
                                <div key={img.id} className={styles.galleryItem} onClick={() => openLightbox(idx)}>
                                    <img src={getStorageUrl(img.url)} alt={img.caption || "Foto do artista"} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className={styles.lightboxOverlay} onClick={closeLightbox}>
                    <button className={styles.closeBtn} onClick={closeLightbox}>×</button>

                    <button className={styles.navBtn} style={{ left: '20px' }} onClick={prevImage}>&#10094;</button>

                    <img
                        src={getStorageUrl(gallery[currentImageIndex].url)}
                        className={styles.lightboxImage}
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button className={styles.navBtn} style={{ right: '20px' }} onClick={nextImage}>&#10095;</button>

                    {gallery[currentImageIndex].caption && (
                        <div className={styles.caption}>{gallery[currentImageIndex].caption}</div>
                    )}
                </div>
            )}

            {
                user && (
                    <ChatModal
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        recipientId={artist.id}
                        recipientName={artist.artisticName}
                        recipientAvatar={avatarUrl}
                    />
                )
            }
        </div >
    );
};
export default ArtistProfile;
