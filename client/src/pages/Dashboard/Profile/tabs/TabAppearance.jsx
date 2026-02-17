import React from 'react';
import styles from './TabStyles.module.css';
import { FiMonitor, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

const TabAppearance = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className={styles.tabContainer}>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiMonitor /> Interface do Sistema
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                    <div
                        onClick={() => setTheme('light')}
                        style={{
                            background: theme === 'light' ? '#1db954' : '#222',
                            border: theme === 'light' ? 'none' : '1px solid #333',
                            padding: 20, borderBottomLeftRadius: 12, borderTopLeftRadius: 12, textAlign: 'center', cursor: 'pointer',
                            color: theme === 'light' ? '#000' : '#fff'
                        }}
                    >
                        <FiSun size={24} style={{ marginBottom: 10 }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: theme === 'light' ? 700 : 400 }}>Claro</div>
                    </div>
                    <div
                        onClick={() => setTheme('dark')}
                        style={{
                            background: theme === 'dark' ? '#1db954' : '#222',
                            border: theme === 'dark' ? 'none' : '1px solid #333',
                            padding: 20, textAlign: 'center', cursor: 'pointer',
                            color: theme === 'dark' ? '#000' : '#fff'
                        }}
                    >
                        <FiMoon size={24} style={{ marginBottom: 10 }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: theme === 'dark' ? 700 : 400 }}>Escuro</div>
                    </div>
                    <div
                        onClick={() => setTheme('system')}
                        style={{
                            background: theme === 'system' ? '#1db954' : '#222',
                            border: theme === 'system' ? 'none' : '1px solid #333',
                            padding: 20, borderBottomRightRadius: 12, borderTopRightRadius: 12, textAlign: 'center', cursor: 'pointer',
                            color: theme === 'system' ? '#000' : '#fff'
                        }}
                    >
                        <FiMonitor size={24} style={{ marginBottom: 10 }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: theme === 'system' ? 700 : 400 }}>Sistema</div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Cor Principal do Artista</h3>
                <div style={{ display: 'flex', gap: 15 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1db954', border: '3px solid #fff' }}></div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E1306C' }}></div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2E77D0' }}></div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F59B23' }}></div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 15 }}>
                    Esta cor será usada em seu perfil público e botões de play.
                </p>
            </div>
        </div>
    );
};

export default TabAppearance;
