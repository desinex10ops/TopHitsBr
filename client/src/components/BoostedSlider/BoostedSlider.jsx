import { getStorageUrl } from '../../utils/urlUtils';
import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiPlay, FiUser, FiPlusSquare, FiDownload, FiList, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './BoostedSlider.module.css';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';

const BoostedSlider = () => {
    const [boosts, setBoosts] = useState([]);
    const { playTrack, addBatchToPendrive } = usePlayer();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [title, setTitle] = useState('💿 CDs Recomendados');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. Try to fetch active boosts
                const boostRes = await api.get('/credits/boost/active?limit=10&type=album');
                let items = Array.isArray(boostRes.data) ? boostRes.data
                    .filter(b => b && b.item)
                    .map(b => b.item) : [];

                // 2. If no boosts, fetch random albums to ensure section appears (Fallback)
                if (items.length === 0) {
                    console.warn("Nenhum boost encontrado. Buscando álbuns aleatórios para preencher.");
                    setTitle('🔥 CDs Mais Acessados (Recomendados)');

                    const musicRes = await api.get('/music');
                    const musicData = Array.isArray(musicRes.data) ? musicRes.data : [];
                    // Group/Unique logic
                    const uniqueAlbums = Object.values(musicData.reduce((acc, track) => {
                        if (!acc[track.album]) acc[track.album] = track;
                        return acc;
                    }, {}));

                    // Shuffle and take 10
                    items = uniqueAlbums.sort(() => 0.5 - Math.random()).slice(0, 10);
                }

                setBoosts(items);
            } catch (error) {
                console.error("Erro ao carregar recomendados:", error);
            }
        };

        fetchContent();
    }, []);

    if (boosts.length === 0) return null;

    const fetchAlbumTracks = async (item) => {
        try {
            const res = await api.get('/music', {
                params: {
                    artist: item.artist,
                    album: item.album
                }
            });
            return res.data;
        } catch (error) {
            console.error("Erro ao buscar músicas do álbum:", error);
            addToast("Erro ao buscar músicas.", "error");
            return [];
        }
    };

    const handlePlay = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        playTrack(item);
    };

    const handleAddToPendrive = async (e, item) => {
        e.stopPropagation();
        const tracks = await fetchAlbumTracks(item);
        if (tracks.length > 0) {
            addBatchToPendrive(tracks);
        }
    };

    const handleDownload = async (e, item) => {
        e.stopPropagation();
        addToast(`Iniciando download: ${item.album}...`, "info");
        const tracks = await fetchAlbumTracks(item);

        if (tracks.length === 0) return;

        // Loop download
        tracks.forEach((track, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                // Construct URL
                link.href = getStorageUrl(track.filepath);
                link.setAttribute('download', `${track.artist} - ${track.title}.mp3`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 1000);
        });
    };

    const handleCreatePlaylist = async (e, item) => {
        e.stopPropagation();
        // Simple "Create Playlist" flow for now
        const tracks = await fetchAlbumTracks(item);
        if (tracks.length === 0) return;

        const name = prompt(`Criar playlist com álbum "${item.album}"? Digite o nome:`, item.album);
        if (!name) return;

        try {
            // 1. Create Playlist
            const res = await api.post('/music/playlists', { name });
            const playlistId = res.data.id;

            // 2. Add Tracks
            // We need to implement batch add or loop. Backend usually accepts one by one.
            // Let's loop for now (not efficient but works) or check if we have batch endpoint.
            // Based on previous code, we have `POST /active-playlist` logic? No, `POST /music/playlists/:id/tracks`.

            let addedCount = 0;
            for (const track of tracks) {
                await api.post(`/music/playlists/${playlistId}/tracks`, { trackId: track.id });
                addedCount++;
            }

            addToast(`Playlist "${name}" criada com ${addedCount} músicas!`, "success");

        } catch (error) {
            console.error(error);
            addToast("Erro ao criar playlist.", "error");
        }
    };

    const handleCardClick = (item) => {
        const albumId = item.AlbumId || item.id;
        if (albumId) {
            navigate(`/album/${albumId}`);
        } else {
            navigate(`/album/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.album)}`);
        }
    };

    return (
        <section className={styles.section} style={{ marginTop: '60px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <h3 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {title}
            </h3>

            <div className={styles.slider}>
                {boosts.map((item, index) => (
                    <div
                        key={index}
                        className={styles.card}
                        onClick={() => handleCardClick(item)}
                    >
                        <div className={styles.coverWrapper}>
                            <img
                                src={getStorageUrl(item.coverpath)}
                                alt={item.title}
                                className={styles.cover}
                                crossOrigin="anonymous"
                            />

                            {/* Actions Overlay */}
                            <div className={styles.overlay}>
                                <div className={styles.actionsRow}>
                                    {/* Add to Pendrive */}
                                    <button className={styles.actionBtn} onClick={(e) => handleAddToPendrive(e, item)} title="Adicionar ao Pen Drive">
                                        <FiPlusSquare />
                                    </button>

                                    {/* Play */}
                                    <div className={styles.playCircle} onClick={(e) => handlePlay(e, item)} title="Tocar Agora">
                                        <FiPlay size={24} />
                                    </div>

                                    {/* Download */}
                                    <button className={styles.actionBtn} onClick={(e) => handleDownload(e, item)} title="Baixar CD">
                                        <FiDownload />
                                    </button>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <button className={styles.actionBtnSmall} onClick={(e) => handleCreatePlaylist(e, item)} title="Salvar em Playlist">
                                        <FiList /> Salvar
                                    </button>
                                </div>
                            </div>

                            <div className={styles.badge}>#{index + 1}</div>

                            {/* Smart Boost Indicator */}
                            {(item.smartBoostActive || index === 0) && (
                                <div className={styles.smartBadge}>
                                    <div className={styles.pulseDot}></div>
                                    🚀 Smart Boost
                                </div>
                            )}
                        </div>
                        <div className={styles.info}>
                            <h3 className={styles.itemTitle}>{item.title}</h3>
                            <p className={styles.artistName}>{item.artist}</p>
                            <button
                                className={styles.profileBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.UserId) navigate(`/artist/${item.UserId}`);
                                }}
                            >
                                <FiUser /> Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BoostedSlider;
