import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';
import styles from './AdminSettings.module.css';
import { getStorageUrl } from '../../../utils/urlUtils';
import AdminFooterEditor from './AdminFooterEditor';
import { FiSave, FiImage, FiMonitor, FiSmartphone, FiLayout, FiActivity, FiGlobe, FiSearch, FiCode } from 'react-icons/fi';

const AdminSettings = () => {
    const { settings, updateGlobalSetting, refreshSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = async (key, value, description) => {
        setLoading(true);
        try {
            await api.post('/music/admin/settings', { key, value, description });
            updateGlobalSetting(key, value);
            addToast(`Configuração salva com sucesso!`, 'success');
        } catch (error) {
            addToast('Erro ao salvar configuração.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('settingFile', file);
        formData.append('key', key);

        setLoading(true);
        try {
            const res = await api.post('/music/admin/settings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateGlobalSetting(key, res.data.value);
            addToast("Arquivo enviado com sucesso!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao enviar arquivo.", "error");
        } finally {
            setLoading(false);
        }
    };

    const renderSetting = (label, key, type = 'text', description = '') => {
        let inputValue = localSettings[key] || '';
        if (type === 'color' && !inputValue) {
            inputValue = '#000000'; // HTML5 color input requires 7-char hex
        }

        return (
            <div className={styles.formGroup}>
                <label>{label}</label>
                <div className={styles.row}>
                    <input
                        type={type}
                        value={inputValue}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, [key]: e.target.value }))}
                        className={type === 'color' ? styles.colorInput : ''}
                    />
                    <button
                        className={styles.saveIconBtn}
                        onClick={() => handleSave(key, localSettings[key] || inputValue, description)}
                        disabled={loading}
                    >
                        <FiSave />
                    </button>
                </div>
            </div>
        );
    };

    const renderMediaSetting = (label, key, description, Icon) => (
        <div className={styles.mediaCard}>
            <div className={styles.mediaHeader}>
                <Icon />
                <span>{label}</span>
            </div>
            <div className={styles.preview}>
                {localSettings[key] ? (
                    localSettings[key].toLowerCase().endsWith('.mp4') ? (
                        <video src={getStorageUrl(localSettings[key])} autoPlay muted loop />
                    ) : (
                        <img src={getStorageUrl(localSettings[key])} alt={label} />
                    )
                ) : (
                    <div className={styles.placeholder}>Sem mídia</div>
                )}
            </div>
            <label className={styles.uploadBtn}>
                <FiImage /> Alterar Mídia
                <input type="file" onChange={(e) => handleFileUpload(e, key)} accept="image/*,video/*" />
            </label>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Configurações do Sistema</h1>
                <p>Personalize a aparência e comportamento global do TopHitsBr.</p>
            </div>

            <div className={styles.grid}>
                {/* Left Column: General & Theme */}
                <div className={styles.column}>
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FiGlobe /> <h3>Aparência & Identidade</h3>
                        </div>
                        {renderSetting('Nome do Site', 'site_name', 'text', 'Nome principal da aba do navegador')}
                        <div className={styles.themeGrid}>
                            {renderSetting('Cor Principal (Botões e Links)', 'color_accent', 'color', 'Cor principal de botões e links')}
                            {renderSetting('Fundo Primário', 'color_primary', 'color', 'Cor de fundo das páginas')}
                            {renderSetting('Fundo Secundário', 'color_secondary', 'color', 'Cor de cards e menus')}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FiActivity /> <h3>Marketplace & Regras</h3>
                        </div>
                        {renderSetting('Comissão da Plataforma (%)', 'sales_commission', 'number', 'Porcentagem retida em cada venda')}
                        <div className={styles.toggleGroup}>
                            <label>Modo de Manutenção</label>
                            <input
                                type="checkbox"
                                checked={localSettings.maintenance_mode === 'true'}
                                onChange={(e) => handleSave('maintenance_mode', e.target.checked.toString(), 'Modo manutenção')}
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column: Banners */}
                <div className={styles.column}>
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FiLayout /> <h3>Banners da Home</h3>
                        </div>
                        <div className={styles.mediaGrid}>
                            {renderMediaSetting('Desktop', 'banner_image', 'Banner principal desktop', FiMonitor)}
                            {renderMediaSetting('Mobile', 'home_banner_mobile', 'Banner otimizado para celulares', FiSmartphone)}
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            {renderSetting('Título do Banner', 'banner_title', 'text', 'Título principal exibido no banner')}
                            {renderSetting('Subtítulo do Banner', 'banner_subtitle', 'text', 'Texto secundário do banner')}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FiSearch /> <h3>SEO & Indexação</h3>
                        </div>
                        {renderSetting('Título SEO (Base)', 'seo_title_base', 'text', 'Título base concatenado nas páginas')}
                        {renderSetting('Meta Descrição', 'seo_meta_description', 'text', 'Descrição para Google')}
                        {renderSetting('Palavras-chave', 'seo_keywords', 'text', 'Tags separadas por vírgula')}
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FiCode /> <h3>Scripts & Tracking</h3>
                        </div>
                        {renderSetting('Google Analytics ID', 'seo_ga_id', 'text', 'ID G-XXXXXXXXXX')}
                        {renderSetting('Facebook Pixel ID', 'seo_fb_pixel', 'text', 'ID do Pixel para anúncios')}
                    </section>
                </div>
            </div>

            {/* Footer Editor Section */}
            <AdminFooterEditor
                footerData={localSettings.site_footer}
                onSave={(data) => handleSave('site_footer', JSON.stringify(data), 'Configuração do Rodapé (JSON)')}
            />
        </div>
    );
};

export default AdminSettings;
