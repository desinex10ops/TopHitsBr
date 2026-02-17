import React, { useState } from 'react';
import styles from './Marketing.module.css';
import MarketingOverview from './MarketingOverview';
import MarketingSettings from './MarketingSettings';
import { useAuth } from '@/contexts/AuthContext';

const Marketing = () => {
    const { user } = useAuth();
    const isAdmin = user?.type === 'admin';
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Marketing & Promoções</h1>
                {isAdmin && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Visão Geral
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Configurações Avançadas
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'overview' ? (
                <MarketingOverview />
            ) : (
                <MarketingSettings />
            )}
        </div>
    );
};

export default Marketing;
