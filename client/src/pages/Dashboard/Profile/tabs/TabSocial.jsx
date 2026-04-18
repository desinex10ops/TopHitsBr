import React from 'react';
import styles from './TabStyles.module.css';
import { FiInstagram, FiYoutube, FiMessageCircle, FiVideo } from 'react-icons/fi';

const TabSocial = ({ formData, onChange, onSave, saving }) => {
    return (
        <div className={styles.tabContainer}>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiInstagram /> Presença Digital
                </h3>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Instagram</label>
                    <div style={{ position: 'relative' }}>
                        <FiInstagram style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#E1306C' }} />
                        <input
                            name="instagram"
                            className={styles.input}
                            style={{ paddingLeft: 45 }}
                            value={formData.instagram}
                            onChange={onChange}
                            placeholder="https://instagram.com/seu_perfil"
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>TikTok</label>
                    <div style={{ position: 'relative' }}>
                        <FiVideo style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#000' }} />
                        <input
                            name="tiktok"
                            className={styles.input}
                            style={{ paddingLeft: 45 }}
                            value={formData.tiktok}
                            onChange={onChange}
                            placeholder="https://tiktok.com/@seu_perfil"
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>YouTube</label>
                    <div style={{ position: 'relative' }}>
                        <FiYoutube style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#FF0000' }} />
                        <input
                            name="youtube"
                            className={styles.input}
                            style={{ paddingLeft: 45 }}
                            value={formData.youtube}
                            onChange={onChange}
                            placeholder="https://youtube.com/c/seu_canal"
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>WhatsApp / Fan Club</label>
                    <div style={{ position: 'relative' }}>
                        <FiMessageCircle style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--dynamic-accent)' }} />
                        <input
                            name="whatsapp"
                            className={styles.input}
                            style={{ paddingLeft: 45 }}
                            value={formData.whatsapp}
                            onChange={onChange}
                            placeholder="Ex: 5511999999999"
                        />
                    </div>
                </div>
            </div>

            <button
                className={styles.saveBtn}
                onClick={onSave}
                disabled={saving}
            >
                {saving ? 'Salvando...' : 'Salvar Redes Sociais'}
            </button>
        </div>
    );
};

export default TabSocial;
