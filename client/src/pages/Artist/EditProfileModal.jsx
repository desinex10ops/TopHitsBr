import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCamera, FiVideo } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './EditProfileModal.module.css';
import { getStorageUrl } from '../../utils/urlUtils';

const EditProfileModal = ({ onClose, onSuccess }) => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        artisticName: '',
        bio: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        city: '',
        state: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerVideoFile, setBannerVideoFile] = useState(null);

    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);
    const [previewBannerVideo, setPreviewBannerVideo] = useState(null);

    const [loading, setLoading] = useState(false);

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const bannerVideoInputRef = useRef(null);

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
                setPreviewBannerVideo(null);
            } else if (type === 'bannerVideo') {
                setBannerVideoFile(file);
                setPreviewBannerVideo(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        if (avatarFile) data.append('avatar', avatarFile);
        if (bannerFile) data.append('banner', bannerFile);
        if (bannerVideoFile) data.append('bannerVideo', bannerVideoFile);

        try {
            const res = await api.put('/auth/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (updateUser) updateUser(res.data.user);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const bannerUrl = previewBanner || (user?.banner ? getStorageUrl(user.banner) : 'https://via.placeholder.com/800x200/333');
    const bannerVideoUrl = previewBannerVideo || (user?.bannerVideo ? getStorageUrl(user.bannerVideo) : null);
    const avatarUrl = previewAvatar || (user?.avatar ? getStorageUrl(user.avatar) : 'https://via.placeholder.com/150');

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                <h2>Editar Perfil</h2>

                <form onSubmit={handleSubmit}>
                    {/* Banner */}
                    <div className={styles.bannerContainer}>
                        {bannerVideoUrl ? (
                            <video src={bannerVideoUrl} className={styles.bannerImage} autoPlay muted loop />
                        ) : (
                            <img src={bannerUrl} alt="Banner" className={styles.bannerImage} />
                        )}
                        <div className={styles.bannerOverlay}>
                            <button type="button" onClick={() => bannerInputRef.current.click()} className={styles.editBtn}>
                                <FiCamera /> Foto
                            </button>
                            <button type="button" onClick={() => bannerVideoInputRef.current.click()} className={styles.editBtn}>
                                <FiVideo /> Vídeo
                            </button>
                        </div>
                        <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={e => handleFileChange(e, 'banner')} />
                        <input ref={bannerVideoInputRef} type="file" accept="video/*" hidden onChange={e => handleFileChange(e, 'bannerVideo')} />
                    </div>

                    {/* Avatar */}
                    <div className={styles.avatarContainer}>
                        <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
                        <button type="button" onClick={() => avatarInputRef.current.click()} className={styles.avatarEditBtn}>
                            <FiCamera />
                        </button>
                        <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={e => handleFileChange(e, 'avatar')} />
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Nome Artístico</label>
                            <input name="artisticName" value={formData.artisticName} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Cidade</label>
                            <input name="city" value={formData.city} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Estado</label>
                            <input name="state" value={formData.state} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label>Bio</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Instagram</label>
                            <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                        </div>
                        <div className={styles.formGroup}>
                            <label>YouTube</label>
                            <input name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/..." />
                        </div>
                        <div className={styles.formGroup}>
                            <label>TikTok</label>
                            <input name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="https://tiktok.com/..." />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
                        <button type="submit" disabled={loading} className={styles.saveBtn}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
