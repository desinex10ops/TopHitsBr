import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import styles from './LyricsView.module.css';

const LyricsView = () => {
    const { currentTrack, currentTime, seek } = usePlayer();
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);
    const linesRef = useRef([]);

    // Parse LRC format: [mm:ss.xx] Line content
    const parseLRC = (lrc) => {
        if (!lrc) return [];
        const lines = lrc.split('\n');
        const result = [];

        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

        for (const line of lines) {
            const match = timeRegex.exec(line);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3], 10);

                const time = minutes * 60 + seconds + (milliseconds / 1000);
                const text = line.replace(timeRegex, '').trim();

                if (text) {
                    result.push({ time, text });
                }
            } else if (line.trim()) {
                // Linhas sem timestamp (texto puro)
                result.push({ time: null, text: line.trim() });
            }
        }
        return result;
    };

    useEffect(() => {
        if (currentTrack?.lyrics) {
            const parsed = parseLRC(currentTrack.lyrics);
            setParsedLyrics(parsed);
        } else {
            setParsedLyrics([]);
        }
    }, [currentTrack]);

    useEffect(() => {
        if (!parsedLyrics.length) return;

        // Find current active line
        // We look for the last line that has time <= currentTime
        let index = -1;
        for (let i = 0; i < parsedLyrics.length; i++) {
            if (parsedLyrics[i].time !== null && parsedLyrics[i].time <= currentTime) {
                index = i;
            } else if (parsedLyrics[i].time > currentTime) {
                break;
            }
        }

        if (index !== activeIndex) {
            setActiveIndex(index);
            // Scroll to active line
            if (index !== -1 && linesRef.current[index]) {
                linesRef.current[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [currentTime, parsedLyrics, activeIndex]);

    const handleLineClick = (time) => {
        if (time !== null) {
            seek(time);
        }
    };

    if (!currentTrack) return null;

    if (!currentTrack.lyrics) {
        return (
            <div className={styles.container}>
                <div className={styles.placeholder}>
                    <span style={{ fontSize: '3rem', marginBottom: 10 }}>🎤</span>
                    <span className={styles.message}>Essa música não tem letra cadastrada.</span>
                    <span style={{ fontSize: '0.9rem' }}>Imagine a letra aqui... 🎶</span>
                </div>
            </div>
        );
    }

    // Se tem letra mas não tem timestamps (texto corrido)
    const isSynced = parsedLyrics.some(l => l.time !== null);

    return (
        <div className={styles.container} ref={containerRef}>
            {!isSynced && <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 10 }}>Letra não sincronizada</p>}

            {parsedLyrics.map((line, idx) => (
                <div
                    key={idx}
                    ref={el => linesRef.current[idx] = el}
                    className={`${styles.line} ${idx === activeIndex ? styles.active : ''}`}
                    onClick={() => handleLineClick(line.time)}
                    style={{ cursor: line.time !== null ? 'pointer' : 'default' }}
                >
                    {line.text}
                </div>
            ))}

            {/* Espaço extra no final para scroll */}
            <div style={{ height: '50%' }}></div>
        </div>
    );
};

export default LyricsView;
