import React from 'react';
import styles from './TabStyles.module.css';
import { FiSettings, FiLock, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const TabSettings = () => {
    const { logout, user } = useAuth();

    return (
        <div className={styles.tabContainer}>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiSettings /> Conta
                </h3>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>E-mail de Cadastro</label>
                    <input className={styles.input} value={user?.email || ''} disabled readOnly style={{ opacity: 0.6 }} />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nível de Acesso</label>
                    <input className={styles.input} value={user?.type === 'artist' ? 'Produtor Musical / Artista' : 'Ouvinte'} disabled readOnly style={{ opacity: 0.6 }} />
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiLock /> Segurança
                </h3>
                <button className={styles.input} style={{ width: 'auto', background: 'transparent', borderColor: '#444' }}>
                    Alterar Senha
                </button>
            </div>

            <div className={styles.card} style={{ border: '1px solid #d32f2f33' }}>
                <h3 className={styles.cardTitle} style={{ color: '#f44336' }}>
                    Zona de Perigo
                </h3>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 20 }}>
                    Ao excluir sua conta, todos os seus dados de artista e músicas serão removidos permanentemente.
                </p>
                <div style={{ display: 'flex', gap: 15 }}>
                    <button className={styles.saveBtn} style={{ background: '#d32f2f', color: '#fff', padding: '10px 20px' }}>
                        Excluir Conta
                    </button>
                    <button className={styles.saveBtn} style={{ background: '#333', color: '#fff', padding: '10px 20px' }} onClick={logout}>
                        <FiLogOut /> Sair
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabSettings;
