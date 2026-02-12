import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';
import api from '../../services/api';
import { FiCamera, FiVideo } from 'react-icons/fi';
import { getStorageUrl } from '../../utils/urlUtils';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        artisticName: user?.artisticName || '',
        bio: user?.bio || '',
        instagram: user?.instagram || '',
        youtube: user?.youtube || '',
        tiktok: user?.tiktok || '',
        city: user?.city || '',
        state: user?.state || ''
    });

    // Refs for file inputs
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const bannerVideoInputRef = useRef(null); // [NEW]

    // File states
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerVideoFile, setBannerVideoFile] = useState(null); // [NEW]
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);
    const [previewBannerVideo, setPreviewBannerVideo] = useState(null); // [NEW]

    const [msg, setMsg] = useState({ type: '', content: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                artisticName: user.artisticName || '',
                bio: user.bio || '',
                instagram: user.instagram || '',
                youtube: user.youtube || '',
                tiktok: user.tiktok || '',
                city: user.city || '',
                state: user.state || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'avatar') {
                setAvatarFile(file);
                setPreviewAvatar(URL.createObjectURL(file));
            } else if (type === 'banner') {
                setBannerFile(file);
                setPreviewBanner(URL.createObjectURL(file));
                setPreviewBannerVideo(null); // Clear video preview if image is selected
            } else if (type === 'bannerVideo') {
                setBannerVideoFile(file);
                setPreviewBannerVideo(URL.createObjectURL(file));
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg({ type: '', content: '' });

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            // Only append if value is not null/undefined to avoid sending string "null"
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        if (avatarFile) data.append('avatar', avatarFile);
        if (bannerFile) data.append('banner', bannerFile);
        if (bannerVideoFile) data.append('bannerVideo', bannerVideoFile); // [NEW]

        try {
            console.log("Sending profile update...");
            const res = await api.put('/auth/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Update success:', res.data);
            setMsg({ type: 'success', content: 'Perfil atualizado com sucesso!' });

            if (updateUser) {
                updateUser(res.data.user);
            } else {
                window.location.reload();
            }

        } catch (error) {
            console.error('Update error:', error);
            // Capture specific error message from server
            const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido ao atualizar perfil.';
            setMsg({ type: 'error', content: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    const bannerUrl = previewBanner || (user?.banner ? getStorageUrl(user.banner) : 'https://via.placeholder.com/800x200/333');
    const bannerVideoUrl = previewBannerVideo || (user?.bannerVideo ? getStorageUrl(user.bannerVideo) : null);
    const avatarUrl = previewAvatar || (user?.avatar ? getStorageUrl(user.avatar) : 'https://via.placeholder.com/150');

    return (
        <div className={styles.pageContent} style={{ paddingBottom: 50 }}>
            <h2>Meu Perfil</h2>

            <div style={{ marginTop: 20, maxWidth: 800 }}>
                {msg.content && (
                    <div style={{
                        padding: 10,
                        marginBottom: 20,
                        borderRadius: 4,
                        background: msg.type === 'error' ? '#ff555533' : '#1db95433',
                        color: msg.type === 'error' ? '#ff5555' : '#1db954',
                        border: `1px solid ${msg.type === 'error' ? '#ff5555' : '#1db954'}`
                    }}>
                        {msg.content}
                    </div>
                )}

                <div className="profile-form">

                    {/* Banner Preview & Upload */}
                    <div style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        position: 'relative',
                        border: '1px solid #333',
                        overflow: 'hidden',
                        backgroundColor: '#000'
                    }}>
                        {bannerVideoUrl ? (
                            <video
                                src={bannerVideoUrl}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                autoPlay muted loop playsInline
                            />
                        ) : (
                            <div style={{
                                width: '100%', height: '100%',
                                backgroundImage: `url(${bannerUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }} />
                        )}

                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '10px', zIndex: 10 }}>
                            <div
                                onClick={() => bannerVideoInputRef.current.click()}
                                style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    color: '#fff',
                                    padding: '8px 15px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <FiVideo /> {bannerVideoUrl ? 'Alterar Vídeo' : 'Adicionar Vídeo'}
                            </div>
                            <div
                                onClick={() => bannerInputRef.current.click()}
                                style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    color: '#fff',
                                    padding: '8px 15px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <FiCamera /> {bannerUrl && !bannerVideoUrl ? 'Alterar Imagem' : 'Imagem'}
                            </div>
                        </div>

                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'banner')}
                            hidden
                        />
                        <input
                            ref={bannerVideoInputRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e, 'bannerVideo')}
                            hidden
                        />
                    </div>

                    {/* Avatar Preview & Upload */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '30px',
                        marginTop: '-60px',
                        position: 'relative',
                        paddingLeft: '20px'
                    }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <img src={avatarUrl} alt="Avatar" style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '4px solid #121212',
                                backgroundColor: '#333'
                            }} />
                            <div
                                onClick={() => avatarInputRef.current.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    background: '#1db954',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                    zIndex: 10
                                }}
                            >
                                <FiCamera size={18} />
                            </div>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'avatar')}
                                hidden
                            />
                        </div>
                        <div style={{ paddingTop: '40px' }}>
                            <h3 style={{ margin: 0 }}>{user?.artisticName || user?.name}</h3>
                            <p style={{ color: '#888', margin: 0 }}>{user?.type === 'artist' ? 'Artista' : 'Ouvinte'}</p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>Nome Completo</label>
                            <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                        </div>

                        {user?.type !== 'listener' && (
                            <div style={{ marginBottom: 15 }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>Nome Artístico</label>
                                <input name="artisticName" value={formData.artisticName} onChange={handleChange} style={inputStyle} />
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', gap: 20 }}>
                        <div style={{ marginBottom: 15, flex: 1 }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>Cidade</label>
                            <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: 15, width: '100px' }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>Estado</label>
                            <input name="state" value={formData.state} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <h3 style={{ marginTop: 20, marginBottom: 15 }}>Redes Sociais</h3>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>Instagram</label>
                        <input name="instagram" value={formData.instagram} onChange={handleChange} style={inputStyle} placeholder="https://instagram.com/..." />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>YouTube</label>
                        <input name="youtube" value={formData.youtube} onChange={handleChange} style={inputStyle} placeholder="https://youtube.com/..." />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: 5 }}>TikTok</label>
                        <input name="tiktok" value={formData.tiktok} onChange={handleChange} style={inputStyle} placeholder="https://tiktok.com/..." />
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: '#1DB954',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: 20,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: 20,
                            fontSize: '1rem',
                            width: '100%'
                        }}
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    background: '#333',
    border: '1px solid #444',
    color: 'white',
    borderRadius: '4px',
    fontSize: '0.95rem'
};

export default Profile;
