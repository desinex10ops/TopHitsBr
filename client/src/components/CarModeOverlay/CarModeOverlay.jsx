import { getStorageUrl } from '../../utils/urlUtils';
import React from 'react';
import styles from './CarModeOverlay.module.css';
import { usePlayer } from '@/contexts/PlayerContext';

import { FiMic, FiMicOff } from 'react-icons/fi'; // [NEW]

const CarModeOverlay = () => {
    const {
        carMode,
        setCarMode,
        currentTrack,
        isPlaying,
        togglePlay,
        playNext,
        playPrevious,
        currentTime,
        duration,
    } = usePlayer();

    // Wake Lock State
    const wakeLockRef = React.useRef(null);

    // Voice Control State
    const [isListening, setIsListening] = React.useState(false);
    const [lastCommand, setLastCommand] = React.useState('');
    const recognitionRef = React.useRef(null);

    React.useEffect(() => {
        if (carMode) {
            // Request Wake Lock
            const requestWakeLock = async () => {
                try {
                    if ('wakeLock' in navigator) {
                        wakeLockRef.current = await navigator.wakeLock.request('screen');
                        console.log('Wake Lock active!');
                    }
                } catch (err) {
                    console.error(`${err.name}, ${err.message}`);
                }
            };
            requestWakeLock();

            // Re-request if visibility changes
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    requestWakeLock();
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Init Speech Recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false; // Stop after one command
                recognitionRef.current.lang = 'pt-BR';
                recognitionRef.current.interimResults = false;

                recognitionRef.current.onresult = (event) => {
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    console.log('Voz:', transcript);
                    setLastCommand(`Comando: "${transcript}"`);
                    processCommand(transcript);
                    setIsListening(false);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error('Erro de voz:', event.error);
                    setIsListening(false);
                    setLastCommand('Erro ao ouvir.');
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                if (wakeLockRef.current) wakeLockRef.current.release();
                if (recognitionRef.current) recognitionRef.current.abort();
            };
        }
    }, [carMode, isPlaying]); // Depend on isPlaying to toggle correctly? Logic handled in function.

    const processCommand = (cmd) => {
        if (cmd.includes('próxima') || cmd.includes('pular') || cmd.includes('avançar') || cmd.includes('next')) {
            playNext();
        } else if (cmd.includes('anterior') || cmd.includes('voltar') || cmd.includes('back')) {
            playPrevious();
        } else if (cmd.includes('pausar') || cmd.includes('parar') || cmd.includes('stop')) {
            if (isPlaying) togglePlay();
        } else if (cmd.includes('tocar') || cmd.includes('reproduzir') || cmd.includes('play')) {
            if (!isPlaying) togglePlay();
        } else if (cmd.includes('continuar')) {
            if (!isPlaying) togglePlay();
        } else {
            setLastCommand(`Comando desconhecido: "${cmd}"`);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            setLastCommand("Navegador sem suporte a voz.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setLastCommand('Ouvindo...');
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (!carMode) return null;

    // Format for Car Mode (simpler)
    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={styles.overlay}>
            {/* Header / Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.logoArea}>
                    🚗 MODO CARRO
                </div>
                <button className={styles.exitBtn} onClick={() => setCarMode(false)}>
                    SAIR
                </button>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {currentTrack ? (
                    <>
                        {/* Track Info (Big Text) */}
                        <div className={styles.trackInfo}>
                            <h1 className={styles.title}>{currentTrack.title}</h1>
                            <h2 className={styles.artist}>{currentTrack.artist}</h2>
                        </div>

                        {/* Progress Line (Minimal) */}
                        <div className={styles.progressWrapper}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className={styles.timeRow}>
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* HUGE Controls */}
                        <div className={styles.controlsGrid}>
                            <button className={styles.prevBtn} onClick={playPrevious}>
                                ⏮
                            </button>

                            <button
                                className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
                                onClick={togglePlay}
                            >
                                {isPlaying ? 'PAUSAR' : 'TOCAR'}
                            </button>

                            <button className={styles.nextBtn} onClick={playNext}>
                                ⏭
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <h2>Pausado</h2>
                        <p>Selecione uma playlist antes de dirigir.</p>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <button
                    className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}
                    onClick={toggleListening}
                >
                    {isListening ? <FiMic /> : <FiMicOff />}
                </button>
                <div className={styles.voiceHint}>
                    {lastCommand || 'Toque no microfone e diga: "Pular", "Pausar", "Tocar"'}
                </div>
            </div>
        </div>
    );
};

export default CarModeOverlay;
