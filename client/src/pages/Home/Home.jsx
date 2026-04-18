import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Home.module.css';
import { usePlayer } from '@/contexts/PlayerContext';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard';
import ImageWithFade from '../../components/ImageWithFade/ImageWithFade';
import PenDriveWidget from '../../components/PenDriveWidget/PenDriveWidget';
import AlbumSlider from '../../components/AlbumSlider/AlbumSlider';
import RecommendedAlbums from '../../components/RecommendedAlbums/RecommendedAlbums';
import AlbumCard from '../../components/AlbumCard/AlbumCard';
import MainBanner from '../../components/MainBanner/MainBanner';
import BoostedSlider from '../../components/BoostedSlider/BoostedSlider';
import FeaturedArtists from '../../components/FeaturedArtists/FeaturedArtists';
import StickyMenu from '../../components/StickyMenu/StickyMenu.jsx';
import TopCDsSection from '../../components/TopCDs/TopCDsSection';
import Stories from '../../components/Stories/Stories';
import HomeHero from '../../components/HomeHero/HomeHero';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { getStorageUrl } from '../../utils/urlUtils';

const Home = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, addToPendrive } = usePlayer();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [featuredTrack, setFeaturedTrack] = useState(null);
    const [featuredAlbums, setFeaturedAlbums] = useState([]); // [NEW]
    const [playlists, setPlaylists] = useState([]);
    const [trending, setTrending] = useState([]);
    const [topPlaylists, setTopPlaylists] = useState([]);

    const penDriveRef = useRef(null);

    const scrollToPenDrive = () => {
        if (penDriveRef.current) {
            penDriveRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    useEffect(() => {
        const search = searchParams.get('search');
        fetchTracks(search);

        if (!search) {
            fetchTrending();
            fetchTopPlaylists();
            fetchFeaturedAlbums(); // [NEW]
            api.get('/playlists/auto')
               .then(res => setPlaylists(Array.isArray(res.data) ? res.data : []))
               .catch(err => { console.error(err); setPlaylists([]); });
        }
    }, [searchParams]);

    const fetchFeaturedAlbums = async () => {
        try {
            const res = await api.get('/music/albums/featured');
            setFeaturedAlbums(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Erro ao carregar álbuns em destaque:", error);
            setFeaturedAlbums([]);
        }
    };

    const fetchTrending = async () => {
        try {
            const res = await api.get('/music/trending');
            setTrending(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Erro ao carregar trending:", error);
            setTrending([]);
        }
    };

    const [searchTracks, setSearchTracks] = useState([]);
    const [searchArtists, setSearchArtists] = useState([]);
    const [searchPlaylists, setSearchPlaylists] = useState([]);

    const fetchTracks = async (searchTerm = '') => {
        try {
            setLoading(true);

            if (searchTerm) {
                // Parallel search requests
                const [trackRes, artistRes, playlistRes] = await Promise.all([
                    api.get('/music', { params: { search: searchTerm } }),
                    api.get('/music/artists/search', { params: { search: searchTerm } }),
                    api.get('/playlists/search', { params: { search: searchTerm } })
                ]);

                const trackData = Array.isArray(trackRes.data) ? trackRes.data : [];
                const artistData = Array.isArray(artistRes.data) ? artistRes.data : [];
                const playlistData = Array.isArray(playlistRes.data) ? playlistRes.data : [];

                setTracks(trackData); // Albums/Tracks mix from original endpoint
                setSearchTracks(trackData.filter(t => !t.album || t.album === 'Singles').slice(0, 5)); // Just songs
                setSearchArtists(artistData);
                setSearchPlaylists(playlistData);
            } else {
                // Default Home Behavior
                const response = await api.get('/music');
                const trackData = Array.isArray(response.data) ? response.data : [];
                setTracks(trackData);
                if (trackData.length > 0) {
                    setFeaturedTrack(trackData[0]);
                }
            }

        } catch (error) {
            console.error('Erro ao buscar músicas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopPlaylists = async () => {
        try {
            const res = await api.get('/playlists/top');
            setTopPlaylists(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Erro loading top playlists:", error);
            setTopPlaylists([]);
        }
    };

    const getGradient = (name) => {
        const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 40}, 80%, 30%))`;
    };

    const handleAlbumClick = useCallback((album) => {
        const albumId = album.AlbumId || album.id;
        if (albumId) {
            navigate(`/album/${albumId}`);
        } else {
            console.warn("Album ID missing for navigation", album);
            // Fallback to name if ID is somehow missing, but we should aim for ID
            navigate(`/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.album)}`);
        }
    }, [navigate]);

    const uniqueAlbums = useMemo(() => {
        if (!Array.isArray(tracks)) return [];
        return Object.values(tracks.reduce((acc, track) => {
            if (track && track.album && !acc[track.album]) {
                acc[track.album] = track;
            }
            return acc;
        }, {}));
    }, [tracks]);

    return (
        <div className="container">
            {!searchParams.get('search') ? (
                <div className={styles.homeLayout}>
                    <div className={styles.mainContent}>
                        <div className={styles.ctaContainer}>
                            <button className={styles.ctaButton} onClick={scrollToPenDrive}>
                                🔄 Atualize seu Pen Drive
                            </button>
                        </div>

                        <StickyMenu />

                        {/* Mobile Greeting */}
                        <div className={styles.mobileGreeting}>
                            {(() => {
                                const hour = new Date().getHours();
                                const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
                                return `${greeting}, ouvinte!`;
                            })()}
                        </div>

                        <div className={styles.mobileOnly}>
                            <Stories />
                            <HomeHero />
                        </div>

                        <div className={`${styles.desktopOnly} ${styles.mobileHidden}`}>
                            <MainBanner />
                        </div>

                        <div className={styles.featuredArtistsWrapper}>
                            <FeaturedArtists />
                        </div>

                        <div id="boosted-section" className={styles.boostedWrapper}>
                            <BoostedSlider />
                        </div>

                        <div className={styles.featuredAlbumsWrapper}>
                            <AlbumSlider
                                title="Álbuns em Destaque"
                                albums={featuredAlbums.length > 0 ? featuredAlbums : uniqueAlbums}
                                onAlbumClick={handleAlbumClick}
                            />
                        </div>

                        <div id="top-cds-section">
                            <TopCDsSection albums={uniqueAlbums} />
                        </div>

                        {topPlaylists.length > 0 && (
                            <section className={styles.section}>
                                <SectionHeader title="🏆 Playlists Mais Tocadas" to="/playlists" />
                                <div className={styles.grid}>
                                    {topPlaylists.map(pl => (
                                        <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.card} style={{ textDecoration: 'none', background: '#1a1a1a' }}>
                                            <div style={{
                                                height: '180px',
                                                background: pl.cover ? 'none' : getGradient(pl.name),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3rem',
                                                color: '#fff',
                                                borderRadius: '6px',
                                                marginBottom: '24px',
                                                position: 'relative',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                            }}>
                                                {pl.cover ? (
                                                    <img src={getStorageUrl(pl.cover)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                                ) : (
                                                    <span style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
                                                        {pl.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                )}

                                                <div className={styles.overlay}>
                                                    <button className={styles.playBtn}>▶</button>
                                                </div>
                                            </div>
                                            <div className={styles.info}>
                                                <h3 className={styles.trackTitle} style={{ fontSize: '1.1rem' }}>{pl.name}</h3>
                                                <p className={styles.artistName} style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                                    {pl.User ? (pl.User.artisticName || pl.User.name) : 'Usuário'}
                                                </p>
                                                <div style={{ marginTop: '5px', fontSize: '12px', color: 'var(--dynamic-accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    🔥 {pl.plays ? pl.plays.toLocaleString() : 0} plays
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div id="pendrive-section" ref={penDriveRef} className={styles.penDriveSection}>
                            <div className={styles.penDriveWidgetWrapper}>
                                <PenDriveWidget />
                            </div>
                        </div>

                        <div className={styles.mobileHidden}>
                            <RecommendedAlbums />
                        </div>

                        {playlists.length > 0 && (
                            <section className={styles.section}>
                                <SectionHeader title="Feito para Você" subtitle="Baseado no seu gosto" />
                                <div className={styles.grid} style={{ marginBottom: '40px' }}>
                                    {playlists.map(pl => (
                                        <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.card} style={{ textDecoration: 'none', background: '#222' }}>
                                            <div style={{
                                                height: '180px',
                                                background: 'linear-gradient(135deg, #444, #111)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3rem'
                                            }}>
                                                {pl.title.split(' ')[0]}
                                            </div>
                                            <div className={styles.info}>
                                                <h3 className={styles.trackTitle}>{pl.title}</h3>
                                                <p className={styles.artistName}>{pl.description}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section id="recent-releases-section" className={styles.section}>
                            <SectionHeader title="Lançamentos Recentes" to="/releases" />
                            {loading ? (
                                <div className={styles.grid}>
                                    {[...Array(10)].map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.grid}>
                                    {uniqueAlbums.map((album, index) => (
                                        <AlbumCard key={`${album.album}-${index}`} album={album} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            ) : (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Resultados para "{searchParams.get('search')}"
                    </h2>

                    {loading ? (
                        <div className={styles.grid}>
                            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <>
                            {/* ARTISTS SECTION */}
                            {searchArtists.length > 0 && (
                                <div className={styles.searchSection}>
                                    <h3 className={styles.subTitle}>Artistas</h3>
                                    <div className={styles.artistGrid}>
                                        {searchArtists.map(artist => (
                                            <Link to={`/artist/${artist.id}`} key={artist.id} className={styles.artistCard}>
                                                <img
                                                    src={getStorageUrl(artist.avatar)}
                                                    alt={artist.artisticName}
                                                    className={styles.artistAvatar}
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                                />
                                                <span className={styles.artistNameLabel}>{artist.artisticName || artist.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SONGS SECTION */}
                            {searchTracks.length > 0 && (
                                <div className={styles.searchSection}>
                                    <h3 className={styles.subTitle}>Músicas</h3>
                                    <div className={styles.trackList}>
                                        {searchTracks.map(track => (
                                            <div key={track.id} className={styles.trackItem} onClick={() => playTrack(track, searchTracks)}>
                                                <img src={getStorageUrl(track.coverpath)} className={styles.trackCover} />
                                                <div className={styles.trackInfo}>
                                                    <span className={styles.trackName}>{track.title}</span>
                                                    <span className={styles.trackArtist}>{track.artist}</span>
                                                </div>
                                                <button className={styles.playMiniBtn}>▶</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ALBUMS SECTION (Existing) */}
                            {uniqueAlbums.length > 0 && (
                                <div className={styles.searchSection}>
                                    <h3 className={styles.subTitle}>Álbuns</h3>
                                    <div className={styles.grid}>
                                        {uniqueAlbums.map((album, index) => (
                                            <AlbumCard
                                                key={`${album.album}-${index}`}
                                                album={album}
                                                onClick={() => handleAlbumClick(album)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PLAYLISTS SECTION */}
                            {searchPlaylists.length > 0 && (
                                <div className={styles.searchSection}>
                                    <h3 className={styles.subTitle}>Playlists</h3>
                                    <div className={styles.grid}>
                                        {searchPlaylists.map(pl => (
                                            <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.card} style={{ textDecoration: 'none', background: '#1a1a1a' }}>
                                                <div style={{
                                                    height: '180px',
                                                    background: pl.cover && pl.cover !== 'default' ? 'none' : getGradient(pl.name),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '3rem',
                                                    color: '#fff',
                                                    borderRadius: '6px',
                                                    marginBottom: '24px',
                                                    position: 'relative',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}>
                                                    {pl.cover && pl.cover !== 'default' ? (
                                                        <img src={getStorageUrl(pl.cover)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                                    ) : (
                                                        <span style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
                                                            {pl.name.substring(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.info}>
                                                    <h3 className={styles.trackTitle} style={{ fontSize: '1.1rem' }}>{pl.name}</h3>
                                                    <p className={styles.artistName} style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                                        {pl.User ? (pl.User.artisticName || pl.User.name) : 'Usuário'}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* NO RESULTS */}
                            {uniqueAlbums.length === 0 && searchArtists.length === 0 && searchTracks.length === 0 && searchPlaylists.length === 0 && (
                                <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>
                                    <h3>Nenhum resultado encontrado.</h3>
                                    <p>Tente buscar por outro termo.</p>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </div>
    );
};

export default Home;
