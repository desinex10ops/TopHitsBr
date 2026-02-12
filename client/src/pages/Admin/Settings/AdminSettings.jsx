import * as React from 'react';
const { useEffect, useState } = React;
import api from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import styles from './AdminSettings.module.css';
import { getStorageUrl } from '../../../utils/urlUtils';

const AdminSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Fields
    const [siteName, setSiteName] = useState('');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Banner states (mirrored from Highlights, but could be general too)
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerSubtitle, setBannerSubtitle] = useState('');
    const [bannerImage, setBannerImage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/music/admin/settings');
            setSettings(res.data);

            if (res.data.site_name) setSiteName(res.data.site_name);
            if (res.data.maintenance_mode) setMaintenanceMode(res.data.maintenance_mode === 'true');
            if (res.data.banner_title) setBannerTitle(res.data.banner_title);
            if (res.data.banner_subtitle) setBannerSubtitle(res.data.banner_subtitle);
            if (res.data.banner_image) setBannerImage(res.data.banner_image);

        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            addToast('Erro ao carregar configurações.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key, value, description) => {
        try {
            await api.post('/music/admin/settings', { key, value, description });
            addToast(`Configuração "${key}" salva!`, 'success');
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
            if (key === 'banner_image') setBannerImage(res.data.value);
            setSettings(prev => ({ ...prev, [key]: res.data.value }));
            addToast("Arquivo enviado com sucesso!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao enviar arquivo.", "error");
        }
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;

    return (
        <div className={styles.container}>
            <h2>Configurações Gerais</h2>

            <div className={styles.section}>
                <h3>Informações do Site</h3>

                <div className={styles.formGroup}>
                    <label>Nome do Site</label>
                    <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        onBlur={() => handleSave('site_name', siteName, 'Nome do site')}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={maintenanceMode}
                            onChange={(e) => {
                                setMaintenanceMode(e.target.checked);
                                handleSave('maintenance_mode', e.target.checked.toString(), 'Modo de manutenção');
                            }}
                            style={{ marginRight: '10px' }}
                        />
                        Modo de Manutenção (Apenas admins podem acessar)
                    </label>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Customização Visual (Banner Home)</h3>

                <div className={styles.formGroup}>
                    <label>Título do Banner</label>
                    <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        onBlur={() => handleSave('banner_title', bannerTitle, 'Título do banner')}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Subtítulo</label>
                    <input
                        type="text"
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        onBlur={() => handleSave('banner_subtitle', bannerSubtitle, 'Subtítulo do banner')}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Imagem de Fundo</label>
                    <div className={styles.imagePreview}>
                        {bannerImage ? (
                            <img src={getStorageUrl(bannerImage)} alt="Banner" />
                        ) : (
                            <div className={styles.placeholder}>Sem imagem</div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'banner_image')}
                        style={{ marginTop: '10px' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
