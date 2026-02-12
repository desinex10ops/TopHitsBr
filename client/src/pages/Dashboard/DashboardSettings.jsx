import { useState } from 'react';
import { FiSave, FiLock, FiBell, FiMoon } from 'react-icons/fi';
import styles from './Dashboard.module.css';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const DashboardSettings = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
    const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode ?? true);

    // Form States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/change-password', { currentPassword, newPassword });
            alert("Senha alterada com sucesso!");
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error("Erro ao mudar senha:", error);
            alert(error.response?.data?.error || "Erro ao mudar senha.");
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        if (key === 'notifications') setNotifications(value);
        if (key === 'darkMode') setDarkMode(value);

        try {
            // Optimistic update already done in state, now sync with DB
            await api.put('/auth/preferences', {
                notifications: key === 'notifications' ? value : notifications,
                darkMode: key === 'darkMode' ? value : darkMode
            });
        } catch (error) {
            console.error("Erro ao salvar preferências:", error);
            // Revert state if needed, but for now just log
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Configurações</h2>
                    <p className={styles.subtitle}>Gerencie suas preferências</p>
                </div>
            </div>

            <div className={styles.settingsGrid}>
                {/* Account Section */}
                <div className={styles.settingsSection}>
                    <h3 className={styles.sectionTitle}>
                        <FiLock /> Segurança
                    </h3>
                    <form className={styles.settingsForm} onSubmit={handlePasswordChange}>
                        <div className={styles.formGroup}>
                            <label>Senha Atual</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nova Senha</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.primaryBtn} disabled={loading}>
                            <FiSave /> {loading ? 'Salvando...' : 'Atualizar Senha'}
                        </button>
                    </form>
                </div>

                {/* Preferences Section */}
                <div className={styles.settingsSection}>
                    <h3 className={styles.sectionTitle}>
                        <FiBell /> Preferências
                    </h3>

                    <div className={styles.toggleGroup}>
                        <div className={styles.toggleItem}>
                            <div className={styles.toggleInfo}>
                                <h4>Notificações por Email</h4>
                                <p>Receber novidades sobre lançamentos</p>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={styles.toggleItem}>
                            <div className={styles.toggleInfo}>
                                <h4>Tema Escuro</h4>
                                <p>Melhor para os olhos em ambientes escuros</p>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
