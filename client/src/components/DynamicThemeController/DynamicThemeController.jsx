import * as React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

const DynamicThemeController = () => {
    const { themeColors } = usePlayer();

    React.useEffect(() => {
        console.log("DynamicThemeController: themeColors updated", themeColors);
        const root = document.documentElement;

        // DEBUG: Flash Red on Mount/Update to prove it works
        // root.style.setProperty('--dynamic-primary', 'red');
        // setTimeout(() => {
        if (themeColors) {
            root.style.setProperty('--dynamic-primary', themeColors.primary);
            root.style.setProperty('--dynamic-secondary', themeColors.secondary);
            root.style.setProperty('--dynamic-accent', themeColors.accent);
            root.style.setProperty('--dynamic-overlay', 'rgba(0,0,0,0.5)'); // Ensure overlay is set

            // Optional: Set meta theme-color for mobile browsers
            let metaThemeColor = document.querySelector("meta[name='theme-color']");
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.name = "theme-color";
                document.head.appendChild(metaThemeColor);
            }
            metaThemeColor.content = themeColors.primary;
        }
        // }, 500);

    }, [themeColors]);

    return null;
};

export default DynamicThemeController;
