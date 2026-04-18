import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { getStorageUrl } from '../../../utils/urlUtils';

// Helper Styles
const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px',
    background: '#222',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    marginTop: '5px'
};

const btnStyle = {
    padding: '8px 16px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'inline-block',
    textAlign: 'center'
};

const AdminHighlights = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Form States
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerSubtitle, setBannerSubtitle] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    const [bannerVideo, setBannerVideo] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/music/admin/settings');
            setSettings(res.data);

            // Populate local state
            if (res.data.banner_title) setBannerTitle(res.data.banner_title);
            if (res.data.banner_subtitle) setBannerSubtitle(res.data.banner_subtitle);
            if (res.data.banner_image) setBannerImage(res.data.banner_image);
            if (res.data.banner_video) setBannerVideo(res.data.banner_video);

        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            addToast('Erro ao carregar destaques.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key, value, description) => {
        try {
            await api.post('/music/admin/settings', { key, value, description });
            addToast(`Configuração "${key}" salva!`, 'success');
            // Update local settings map
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            addToast('Erro ao salvar configuração.', 'error');
        }
    };

    const handleFileUpload = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('settingFile', file);
        formData.append('key', key);

        try {
            const res = await api.post('/music/admin/settings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newValue = res.data.value;

            // Update local state and settings map
            if (key === 'banner_image') setBannerImage(newValue);
            if (key === 'banner_video') setBannerVideo(newValue);

            setSettings(prev => ({ ...prev, [key]: newValue }));
            addToast("Arquivo enviado com sucesso!", "success");
        } catch (error) {
            console.error(error);
            let msg = error.response?.data?.error || "Erro ao enviar arquivo.";
            addToast(msg, "error");
        }
    };

    // --- Highlights Logic ---
    const [searchTrack, setSearchTrack] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [featuredTracks, setFeaturedTracks] = useState([]);

    useEffect(() => {
        if (settings.featured_track_ids) {
            try {
                const ids = JSON.parse(settings.featured_track_ids);
                if (Array.isArray(ids)) {
                    loadFeaturedTracks(ids);
                }
            } catch (e) {
                console.error("Invalid JSON for featured_track_ids", e);
            }
        }
    }, [settings.featured_track_ids]);

    const loadFeaturedTracks = async (ids) => {
        if (!ids || ids.length === 0) return;

        try {
            // Fetch all tracks to find the featured ones. Ideally backend should support bulk fetch by IDs.
            const res = await api.get('/music');
            const allTracks = res.data;

            const found = [];
            ids.forEach(id => {
                const track = allTracks.find(t => t.id === id);
                if (track) found.push(track);
            });

            setFeaturedTracks(found);
        } catch (error) {
            console.error("Erro ao carregar destaques:", error);
            addToast("Erro ao carregar detalhes dos destaques.", "error");
        }
    };

    const searchTracks = async () => {
        if (!searchTrack) return;
        try {
            const res = await api.get(`/music?search=${searchTrack}`);
            setSearchResults(res.data.slice(0, 5));
        } catch (error) {
            console.error(error);
        }
    };

    const addFeaturedTrack = (track) => {
        if (featuredTracks.find(t => t.id === track.id)) return;
        if (featuredTracks.length >= 5) {
            addToast("Máximo de 5 destaques.", "error");
            return;
        }
        setFeaturedTracks([...featuredTracks, track]);
        setSearchResults([]);
        setSearchTrack('');
    };

    const removeFeaturedTrack = (id) => {
        setFeaturedTracks(featuredTracks.filter(t => t.id !== id));
    };

    const saveFeaturedTracks = async () => {
        const ids = featuredTracks.map(t => t.id);
        await handleSave('featured_track_ids', JSON.stringify(ids), 'IDs das Músicas em Destaque');
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Carregando...</div>;

    return (
        <div style={{ color: '#fff' }}>
            <h2>Destaques e Banners</h2>

            <div style={{ background: '#181818', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Banner Principal (Home)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px' }}>

                    <label>
                        Título do Banner
                        <input
                            type="text"
                            style={inputStyle}
                            value={bannerTitle}
                            onChange={e => setBannerTitle(e.target.value)}
                            onBlur={() => handleSave('banner_title', bannerTitle, 'Título do banner principal')}
                        />
                    </label>

                    <label>
                        Subtítulo
                        <input
                            type="text"
                            style={inputStyle}
                            value={bannerSubtitle}
                            onChange={e => setBannerSubtitle(e.target.value)}
                            onBlur={() => handleSave('banner_subtitle', bannerSubtitle, 'Subtítulo do banner')}
                        />
                    </label>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Imagem de Fundo</label>
                            <div style={{ width: '100%', height: '150px', background: '#222', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', border: '1px solid #333' }}>
                                {bannerImage ? (
                                    <img src={getStorageUrl(bannerImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#666' }}>Sem imagem</span>
                                )}
                            </div>
                            <label style={btnStyle}>
                                Escolher Imagem
                                <input type="file" onChange={(e) => handleFileUpload(e, 'banner_image')} accept="image/*" style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Vídeo de Fundo</label>
                            <div style={{ width: '100%', height: '150px', background: '#222', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', border: '1px solid #333' }}>
                                {bannerVideo ? (
                                    <video src={getStorageUrl(bannerVideo)} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#666' }}>Sem vídeo</span>
                                )}
                            </div>
                            <label style={btnStyle}>
                                Escolher Vídeo
                                <input type="file" onChange={(e) => handleFileUpload(e, 'banner_video')} accept="video/*" style={{ display: 'none' }} />
                            </label>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                                O vídeo substituirá a imagem se presente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ background: '#181818', padding: '20px', borderRadius: '8px' }}>
                <h3>Músicas em Destaque (Fixo no Topo)</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>
                    Selecione as músicas que aparecerão em destaque na Home.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                    <input
                        type="text"
                        style={{ ...inputStyle, width: '300px', marginTop: 0 }}
                        placeholder="Buscar música..."
                        value={searchTrack}
                        onChange={(e) => setSearchTrack(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
                    />
                    <button style={btnStyle} onClick={searchTracks}>Buscar</button>
                </div>

                {searchResults.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: '10px', background: '#222', borderRadius: '4px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                        {searchResults.map(track => (
                            <li key={track.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #333' }}>
                                <img src={getStorageUrl(track.coverpath)} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '10px', objectFit: 'cover' }} />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title} - {track.artist}</span>
                                <button style={{ ...btnStyle, background: 'var(--dynamic-accent)', color: '#000', fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => addFeaturedTrack(track)}>
                                    Adicionar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Destaques Atuais ({featuredTracks.length}/5)</h4>
                    {featuredTracks.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma música selecionada.</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {featuredTracks.map(track => (
                            <li key={track.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: '#222', marginBottom: '5px', borderRadius: '4px' }}>
                                <img src={getStorageUrl(track.coverpath)} alt="" style={{ width: '50px', height: '50px', borderRadius: '4px', marginRight: '15px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{track.title}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#aaa' }}>{track.artist}</div>
                                </div>
                                <button style={{ ...btnStyle, background: '#e50914', fontSize: '0.8rem' }} onClick={() => removeFeaturedTrack(track.id)}>
                                    Remover
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button style={{ ...btnStyle, background: 'var(--dynamic-accent)', color: '#000', padding: '10px 30px' }} onClick={saveFeaturedTracks}>
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminHighlights;
