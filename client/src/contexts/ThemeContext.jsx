import * as React from 'react';

const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = React.useState(() => {
        const saved = localStorage.getItem('app-theme');
        return saved || 'system';
    });

    const applyTheme = (mode) => {
        const root = document.documentElement;
        let effectiveMode = mode;

        if (mode === 'system') {
            effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (effectiveMode === 'light') {
            root.classList.add('light-theme');
            root.style.colorScheme = 'light';
        } else {
            root.classList.remove('light-theme');
            root.style.colorScheme = 'dark';
        }
    };

    React.useEffect(() => {
        applyTheme(theme);
        localStorage.setItem('app-theme', theme);

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
