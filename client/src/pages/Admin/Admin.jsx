import React, { useState } from 'react';
import styles from './Admin.module.css';
import AdminDashboard from './AdminDashboard';
import AdminTracks from './AdminTracks';
import AdminSettings from './Settings/AdminSettings';
import { FiGrid, FiMusic, FiSettings, FiUsers } from 'react-icons/fi';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="container">
            <div className={styles.adminContainer}>
                {/* Sidebar / Tabs */}
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>Admin Painel</h2>
                    <nav className={styles.nav}>
                        <button
                            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <FiGrid /> Dashboard
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'tracks' ? styles.active : ''}`}
                            onClick={() => setActiveTab('tracks')}
                        >
                            <FiMusic /> Músicas
                        </button>
                        <button
                            className={`${styles.navItem}`}
                            onClick={() => alert('Em breve!')}
                        >
                            <FiUsers /> Usuários
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <FiSettings /> Configurações
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className={styles.content}>
                    {activeTab === 'dashboard' && <AdminDashboard />}
                    {activeTab === 'tracks' && <AdminTracks />}
                    {activeTab === 'settings' && <AdminSettings />}
                </div>
            </div>
        </div>
    );
};

export default Admin;
