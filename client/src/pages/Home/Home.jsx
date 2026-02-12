import * as React from 'react';
const { useEffect, useState, useRef } = React;
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Home.module.css';
import { usePlayer } from '../../contexts/PlayerContext';
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
import { getStorageUrl } from '../../utils/urlUtils';

const Home = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, addToPendrive } = usePlayer();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [featuredTrack, setFeaturedTrack] = useState(null);
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
            api.get('/music/playlists').then(res => setPlaylists(res.data)).catch(console.error);
        }
    }, [searchParams]);

    const fetchTrending = async () => {
        try {
            const res = await api.get('/music/trending');
            setTrending(res.data);
        } catch (error) {
            console.error("Erro ao carregar trending:", error);
        }
    };

    const fetchTracks = async (searchTerm = '') => {
        try {
            setLoading(true);
            const response = await api.get('/music', {
                params: { search: searchTerm }
            });
            setTracks(response.data);
            if (!searchTerm && response.data.length > 0) {
                setFeaturedTrack(response.data[0]);
            }
        } catch (error) {
            console.error('Erro ao buscar músicas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopPlaylists = async () => {
        try {
            const res = await api.get('/music/playlists/top');
            setTopPlaylists(res.data);
        } catch (error) {
            console.error("Erro loading top playlists:", error);
        }
    };

    const getGradient = (name) => {
        const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 40}, 80%, 30%))`;
    };

    const handleAlbumClick = (album) => {
        navigate(`/album/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.album)}`);
    };

    const uniqueAlbums = Object.values(tracks.reduce((acc, track) => {
        if (!acc[track.album]) {
            acc[track.album] = track;
        }
        return acc;
    }, {}));

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

                        <MainBanner />

                        <FeaturedArtists />

                        <div id="boosted-section">
                            <BoostedSlider />
                        </div>

                        <AlbumSlider
                            title="Álbuns em Destaque"
                            albums={uniqueAlbums}
                            onAlbumClick={handleAlbumClick}
                        />

                        <div id="top-cds-section">
                            <TopCDsSection albums={uniqueAlbums} />
                        </div>

                        {topPlaylists.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>🏆 Playlists Mais Tocadas</h2>
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
                                                <div style={{ marginTop: '5px', fontSize: '12px', color: '#1DB954', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                            <div className={styles.mobileWarning}>
                                <h3>🖥️ Apenas no Computador</h3>
                                <p>O recurso de Atualizar Pen Drive está disponível apenas na versão para computador (Desktop).</p>
                            </div>
                        </div>

                        <RecommendedAlbums />

                        {playlists.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Feito para Você</h2>
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
                            <h2 className={styles.sectionTitle}>Lançamentos Recentes</h2>
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
                        Álbuns encontrados para "{searchParams.get('search')}"
                    </h2>

                    {loading ? (
                        <div className={styles.grid}>
                            {[...Array(10)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {uniqueAlbums.length > 0 ? (
                                uniqueAlbums.map((album, index) => (
                                    <AlbumCard
                                        key={`${album.album}-${index}`}
                                        album={album}
                                        onClick={() => handleAlbumClick(album)}
                                    />
                                ))
                            ) : (
                                <div style={{ color: '#aaa', padding: '20px' }}>Nenhum álbum encontrado.</div>
                            )}
                        </div>
                    )}

                    <BoostedSlider />
                </section>
            )}
        </div>
    );
};

export default Home;
