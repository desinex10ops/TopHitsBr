import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import MiniPlayer from './MiniPlayer';
import FullscreenPlayer from './FullscreenPlayer';
import styles from './Player.module.css';
import CarModeOverlay from '../CarModeOverlay/CarModeOverlay';

const Player = () => {
    const { currentTrack, carMode, setCarMode } = usePlayer();
    const [isExpanded, setIsExpanded] = useState(false);

    // Lock body scroll when expanded
    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isExpanded]);

    // if (!currentTrack) return null; // Removed to ensure player bar is always part of layout

    return (
        <div className={styles.wrapper}>
            {/* Expanded Immersive Player */}
            {isExpanded && (
                <FullscreenPlayer onMinimize={() => setIsExpanded(false)} />
            )}

            {/* Mini Player / Footer Player */}
            <div className={`${styles.miniWrapper} ${isExpanded ? styles.hidden : ''}`}>
                <MiniPlayer onExpand={() => setIsExpanded(true)} />
            </div>

            {/* Modal Components - Can be rendered here or inside subcomponents */}
            {carMode && <CarModeOverlay onClose={() => setCarMode(false)} />}
        </div>
    );
};

export default Player;
