import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Profile.module.css';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';

// Components
import ProfileHeader from './components/ProfileHeader';
import TabProfile from './tabs/TabProfile';
import TabSocial from './tabs/TabSocial';
import TabAppearance from './tabs/TabAppearance';
import TabStats from './tabs/TabStats';
import TabSettings from './tabs/TabSettings';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        artisticName: '',
        bio: '',
        instagram: '',
        whatsapp: '',
        youtube: '',
        tiktok: '',
        city: '',
        state: ''
    });

    // File states
    const [files, setFiles] = useState({
        avatar: null,
        banner: null,
        bannerVideo: null
    });

    const [previews, setPreviews] = useState({
        avatar: null,
        banner: null,
        bannerVideo: null
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                artisticName: user.artisticName || '',
                bio: user.bio || '',
                instagram: user.instagram || '',
                whatsapp: user.whatsapp || '',
                youtube: user.youtube || '',
                tiktok: user.tiktok || '',
                city: user.city || '',
                state: user.state || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
            setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));

            // If changing banner image, clear banner video preview and vice-versa
            if (type === 'banner') setPreviews(prev => ({ ...prev, bannerVideo: null }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        if (files.avatar) data.append('avatar', files.avatar);
        if (files.banner) data.append('banner', files.banner);
        if (files.bannerVideo) data.append('bannerVideo', files.bannerVideo);

        try {
            const res = await api.put('/auth/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (updateUser) {
                updateUser(res.data.user);
            }

            addToast('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil.';
            addToast(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'profile':
                return <TabProfile formData={formData} onChange={handleChange} onSave={handleSave} saving={saving} userType={user?.type} />;
            case 'appearance':
                return <TabAppearance />;
            case 'social':
                return <TabSocial formData={formData} onChange={handleChange} onSave={handleSave} saving={saving} />;
            case 'stats':
                return <TabStats />;
            case 'settings':
                return <TabSettings />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <ProfileHeader
                user={user}
                previewAvatar={previews.avatar}
                previewBanner={previews.banner}
                previewBannerVideo={previews.bannerVideo}
                onFileChange={handleFileChange}
            />

            <nav className={styles.tabsNav}>
                <div
                    className={`${styles.tabItem} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Perfil
                </div>
                <div
                    className={`${styles.tabItem} ${activeTab === 'appearance' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    Aparência
                </div>
                <div
                    className={`${styles.tabItem} ${activeTab === 'social' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('social')}
                >
                    Redes Sociais
                </div>
                <div
                    className={`${styles.tabItem} ${activeTab === 'stats' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Estatísticas
                </div>
                <div
                    className={`${styles.tabItem} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Configurações
                </div>
            </nav>

            <div className={styles.tabContent}>
                {renderTab()}
            </div>
        </div>
    );
};

export default Profile;
