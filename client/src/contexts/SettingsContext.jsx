import * as React from 'react';
import api from '../services/api';


const SettingsContext = React.createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/music/settings'); // Public route
            setSettings(res.data);
            applySettings(res.data);
        } catch (error) {
            console.error('Erro ao buscar configurações globais:', error);
        } finally {
            setLoading(false);
        }
    };

    const applySettings = (data) => {
        // 1. Dynamic Site Title
        if (data.site_name) {
            document.title = data.site_name;
        }

        // 2. CSS Variables
        const root = document.documentElement;
        if (data.color_primary) root.style.setProperty('--dynamic-primary', data.color_primary);
        if (data.color_secondary) root.style.setProperty('--dynamic-secondary', data.color_secondary);
        if (data.color_accent) root.style.setProperty('--dynamic-accent', data.color_accent);

        // Custom variables if needed
        if (data.accent_color) root.style.setProperty('--accent-color', data.accent_color);
    };

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const updateGlobalSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        applySettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateGlobalSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = React.useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};
