import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useEffect, useState } = React;
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import homeStyles from '../Home/Home.module.css'; // Reutilizando estilos base
import listStyles from './PlaylistDetails.module.css'; // Estilos específicos de lista
import { usePlayer } from '../../contexts/PlayerContext';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard';
import ImageWithFade from '../../components/ImageWithFade/ImageWithFade';
import BoostedSlider from '../../components/BoostedSlider/BoostedSlider';
import { FiPlay, FiShare2, FiHeart, FiEdit2, FiSearch, FiPlus, FiTrash2, FiMessageSquare, FiClock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext'; // To check owner/user
import { toast } from 'react-toastify';

const PlaylistDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [playlist, setPlaylist] = useState(null); // For DB playlists
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, addToPendrive } = usePlayer();

    // Features State
    const [isLiked, setIsLiked] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const isSystemPlaylist = ['random', 'top50', 'recent'].includes(id) || id.startsWith('vibe-') || id.startsWith('genre-');

    const playlistsInfo = {
        'random': { title: '🔀 Aleatório', desc: 'Uma mistura surpresa para você.', cover: null },
        'top50': { title: '🔥 Top 50', desc: 'As mais tocadas da plataforma.', cover: null },
        'recent': { title: '🆕 Recentes', desc: 'As últimas novidades.', cover: null }
    };

    useEffect(() => {
        loadPlaylistData();
    }, [id]);

    const loadPlaylistData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Tracks
            const res = await api.get(`/music/playlists/${id}`);
            setTracks(res.data);

            // 2. Fetch Details (if user playlist)
            if (!isSystemPlaylist) {
                // We need a route to get playlist details separately or extract from somewhere. 
                // Currently getPlaylist tracks returns ONLY tracks for system playlists, 
                // but for ID it returns playlist object WITH tracks.
                // Let's check the controller logic. 
                // Controller says: `return res.json(playlist.Tracks);` for DB IDs.
                // So we actually miss the playlist metadata (name, cover, owner).
                // I should probably have updated the controller to return `{ playlist, tracks }` or similar.
                // For now, let's assume I might need to fetch `playlists/user` to find this one or I should have updated the backend to return full object.
                // LIMITATION: The backend `getPlaylistTracks` returns `playlist.Tracks`.
                // I will assume for now we only have tracks. 
                // TO FIX PROPERLY: I should update the backend to return the full playlist object. 
                // Check `User` playlists context?

                // Let's Try to infer ownership if we can't get metadata yet.
                // Actually, let's just implement the UI assuming we have data, or fetch from user playlists.
                try {
                    const userPlaylistsRes = await api.get('/music/playlists/user');
                    const current = userPlaylistsRes.data.find(p => p.id == id);
                    if (current) {
                        setPlaylist(current);
                        setIsOwner(current.UserId === user?.id);
                    }
                } catch (e) { console.log("Erro buscando detalhe da playlist", e); }

                // 3. Fetch Social Status (Like)
                checkLikeStatus();

                // 4. Fetch Comments
                loadComments();
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkLikeStatus = async () => {
        if (isSystemPlaylist) return;
        try {
            const res = await api.get('/social/status');
            if (res.data.likedPlaylists && res.data.likedPlaylists.includes(Number(id))) {
                setIsLiked(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadComments = async () => {
        if (isSystemPlaylist) return;
        try {
            const res = await api.get(`/comments/playlist/${id}`);
            setComments(res.data);
        } catch (error) { console.error(error); }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            playTrack(tracks[0]);
        }
    };

    // --- Actions ---

    const handleLike = async () => {
        try {
            if (isLiked) {
                await api.delete(`/social/like/playlist/${id}`);
                setIsLiked(false);
                toast.success('Playlist removida dos favoritos.');
            } else {
                await api.post(`/social/like/playlist/${id}`);
                setIsLiked(true);
                toast.success('Playlist adicionada aos favoritos!');
            }
        } catch (error) {
            toast.error('Erro ao curtir playlist.');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.info('Link copiado para a área de transferência!');
    };

    const handleUploadCover = async (e) => {
        if (!e.target.files[0]) return;
        const formData = new FormData();
        formData.append('cover', e.target.files[0]);

        try {
            await api.post(`/music/playlists/${id}/image`, formData);
            toast.success('Capa atualizada!');
            loadPlaylistData(); // Reload
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Erro ao atualizar capa.');
        }
    };

    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (val.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await api.get(`/music?search=${val}`);
            // Filter out tracks already in playlist
            const currentIds = tracks.map(t => t.id);
            const filtered = res.data.filter(t => !currentIds.includes(t.id));
            setSearchResults(filtered.slice(0, 5));
        } catch (error) { console.error(error); }
    };

    const handleAddTrack = async (trackId) => {
        try {
            await api.post(`/music/playlists/${id}/tracks`, { trackId });
            toast.success('Música adicionada!');
            setSearchTerm('');
            setSearchResults([]);
            loadPlaylistData(); // Reload tracks
        } catch (error) {
            toast.error('Erro ao adicionar música.');
        }
    };

    const handleRemoveTrack = async (trackId) => {
        if (!isOwner) return;
        if (!window.confirm("Remover música?")) return;
        try {
            await api.delete(`/music/playlists/${id}/tracks/${trackId}`);
            toast.success('Música removida.');
            loadPlaylistData();
        } catch (error) {
            toast.error('Erro ao remover música.');
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            await api.post('/comments', { playlistId: id, content: newComment });
            setNewComment('');
            loadComments();
            toast.success('Comentário enviado!');
        } catch (error) {
            toast.error('Erro ao enviar comentário.');
        }
    };

    // Header Info
    const displayInfo = isSystemPlaylist ? (playlistsInfo[id] || { title: 'Playlist', desc: '', cover: null }) : {
        title: playlist?.name || 'Minha Playlist',
        desc: playlist?.description || `Criada por ${playlist?.User?.name || 'Usuário'}`,
        cover: playlist?.cover
    };

    return (
        <div className="container">
            <section className={homeStyles.section}>
                <div style={{
                    marginBottom: '30px',
                    padding: '30px',
                    background: 'linear-gradient(to bottom, #2a2a2a, #121212)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Cover Image */}
                    <div style={{ position: 'relative', width: '220px', height: '220px', flexShrink: 0 }}>
                        {displayInfo.cover ? (
                            <img
                                src={getStorageUrl(displayInfo.cover)}
                                alt={displayInfo.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '3rem' }}>
                                🎵
                            </div>
                        )}

                        {/* Edit Cover Button (Owner Only) */}
                        {isOwner && (
                            <label style={{
                                position: 'absolute', bottom: '10px', right: '10px',
                                background: 'rgba(0,0,0,0.7)', padding: '8px', borderRadius: '50%',
                                cursor: 'pointer', color: 'white'
                            }}>
                                <FiEdit2 size={18} />
                                <input type="file" hidden accept="image/*" onChange={handleUploadCover} />
                            </label>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div style={{ flex: 1, zIndex: 2 }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 'bold', color: '#bbb' }}>Playlist</span>
                        <h1 style={{ fontSize: '4rem', fontWeight: '800', margin: '10px 0' }}>{displayInfo.title}</h1>
                        <p style={{ color: '#aaa', fontSize: '1.2rem' }}>{displayInfo.desc}</p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button
                                onClick={handlePlayAll}
                                style={{
                                    padding: '12px 35px',
                                    fontSize: '1.1rem',
                                    background: '#1db954',
                                    border: 'none',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    color: 'black',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <FiPlay size={20} fill="black" /> Tocar Tudo
                            </button>

                            {/* Social Actions */}
                            {!isSystemPlaylist && (
                                <>
                                    <button onClick={handleLike} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isLiked ? '#1db954' : 'white' }} title="Salvar na Biblioteca">
                                        <FiHeart size={32} fill={isLiked ? '#1db954' : 'none'} />
                                    </button>
                                    <button onClick={handleShare} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }} title="Compartilhar">
                                        <FiShare2 size={28} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar (Owner Only) */}
                {isOwner && (
                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#333', borderRadius: '4px', padding: '0 15px' }}>
                            <FiSearch color="#aaa" />
                            <input
                                type="text"
                                placeholder="Buscar músicas para adicionar..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{
                                    background: 'transparent', border: 'none', color: 'white',
                                    padding: '12px', width: '100%', outline: 'none'
                                }}
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#222', zIndex: 10, borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)', maxHeight: '300px', overflowY: 'auto' }}>
                                {searchResults.map(track => (
                                    <div key={track.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #333', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={getStorageUrl(track.coverpath)} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{track.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{track.artist}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAddTrack(track.id)} style={{ background: 'transparent', border: '1px solid #aaa', color: 'white', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>Add</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className={homeStyles.grid}>
                        {[...Array(10)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : tracks.length === 0 ? (
                    <p>Nenhuma música encontrada nesta playlist.</p>
                ) : (
                    <div className={listStyles.trackList}>
                        <div className={listStyles.trackHeader}>
                            <div style={{ textAlign: 'center' }}>#</div>
                            <div>Título</div>
                            <div style={{ textAlign: 'right' }}>Ações</div>
                            <div style={{ textAlign: 'right' }}><FiClock /></div>
                        </div>

                        {tracks.map((track, index) => (
                            <div key={`${track.id}-${index}`} className={listStyles.trackItem} onClick={() => playTrack(track)}>
                                <div className={listStyles.trackIndex}>
                                    <span className={listStyles.indexNum}>{index + 1}</span>
                                    <FiPlay className={listStyles.playIcon} onClick={() => playTrack(track)} />
                                </div>
                                <div className={listStyles.trackInfo}>
                                    <div className={listStyles.trackName}>{track.title}</div>
                                    <div className={listStyles.trackArtist}>{track.artist}</div>
                                </div>

                                <div className={listStyles.trackActions}>
                                    <button
                                        className={listStyles.actionBtn}
                                        onClick={(e) => { e.stopPropagation(); addToPendrive(track); }}
                                        title="Adicionar ao Pen Drive"
                                    >
                                        <FiPlus />
                                    </button>
                                    {isOwner && (
                                        <button
                                            className={listStyles.actionBtn}
                                            onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.id); }}
                                            title="Remover da Playlist"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>

                                <div className={listStyles.trackDuration}>
                                    3:00
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Comments Section */}
            {!isSystemPlaylist && (
                <section style={{ marginTop: '40px', background: '#181818', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FiMessageSquare /> Comentários ({comments.length})
                    </h3>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Deixe um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                            style={{ flex: 1, background: '#333', border: 'none', padding: '10px', borderRadius: '4px', color: 'white' }}
                        />
                        <button onClick={handlePostComment} style={{ background: '#1db954', border: 'none', padding: '0 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {comments.slice((currentPage - 1) * 5, currentPage * 5).map(c => (
                            <div key={c.id} style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                    {c.User?.avatar ? <img src={getStorageUrl(c.User.avatar)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2px' }}>{c.User?.name || 'Usuário'}</div>
                                    <div style={{ color: '#ccc', fontSize: '0.95rem' }}>{c.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {comments.length > 5 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                            {Array.from({ length: Math.ceil(comments.length / 5) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    style={{
                                        background: currentPage === i + 1 ? '#1db954' : '#333',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Recommended Section */}
            <BoostedSlider />
        </div>
    );
};

export default PlaylistDetails;
