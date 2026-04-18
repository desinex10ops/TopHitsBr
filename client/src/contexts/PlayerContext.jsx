import * as React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { getStorageUrl } from '../utils/urlUtils';

const PlayerContext = React.createContext();

export const usePlayer = () => React.useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    console.log("Rendering PlayerProvider");
    const [currentTrack, setCurrentTrack] = React.useState(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [playlist, setPlaylist] = React.useState([]);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [carMode, setCarMode] = React.useState(false); // Novo estado
    const [pendriveItems, setPendriveItems] = React.useState([]);

    // Advanced State
    const [shuffle, setShuffle] = React.useState(false);
    const [repeatMode, setRepeatMode] = React.useState('off'); // 'off', 'all', 'one'
    const [originalPlaylist, setOriginalPlaylist] = React.useState([]);

    const audioRef = React.useRef(null);
    const audioContextRef = React.useRef(null);
    const analyserRef = React.useRef(null);
    const sourceRef = React.useRef(null);

    // Inicializar Contexto de Áudio (User Interaction required usually)
    const initAudioContext = () => {
        if (!audioContextRef.current && audioRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const analyser = ctx.createAnalyser();

            // Configurar análise
            analyser.fftSize = 256; // Detalhe das barras (quanto maior, mais barras)

            // Conectar nós: Source -> Analyser -> Destination (Speakers)
            try {
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(analyser);
                analyser.connect(ctx.destination);

                audioContextRef.current = ctx;
                analyserRef.current = analyser;
                sourceRef.current = source;
            } catch (e) {
                console.warn("AudioContext já conectado ou erro:", e);
            }
        } else if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    React.useEffect(() => {
        // Carregar do localStorage se existir
        const saved = localStorage.getItem('topHitsPenDrive');
        if (saved) setPendriveItems(JSON.parse(saved));
    }, []);

    React.useEffect(() => {
        localStorage.setItem('topHitsPenDrive', JSON.stringify(pendriveItems));
    }, [pendriveItems]);

    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        // Inicializar AudioContext no primeiro Play
        const handlePlayParams = () => initAudioContext();

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('play', handlePlayParams);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('play', handlePlayParams);
            // Cleanup context if needed (avoid closing to keep reuse)
        };
    }, []);

    // Theme Colors
    const [themeColors, setThemeColors] = React.useState({
        primary: '#121212',
        secondary: '#282828',
        accent: 'var(--dynamic-accent)',
        text: '#ffffff'
    });

    const { addToast } = useToast();

    React.useEffect(() => {


        if (currentTrack) {
            // Extract Colors from Cover
            if (currentTrack.coverpath) {
                const imgUrl = getStorageUrl(currentTrack.coverpath);

                // Cache busting for CORS
                const corsUrl = `${imgUrl}?t=${new Date().getTime()}`;

                import('node-vibrant').then((module) => {
                    const Vibrant = module.default || module;
                    console.log(`[Theme] Extracting colors from: ${corsUrl}`);
                    Vibrant.from(corsUrl).getPalette()
                        .then((palette) => {
                            const primary = palette.DarkMuted?.hex || '#121212';
                            const secondary = palette.DarkVibrant?.hex || '#282828';
                            const accent = palette.Vibrant?.hex || 'var(--dynamic-accent)';

                            console.log("[Theme] Colors extracted:", { primary, secondary, accent });

                            setThemeColors({
                                primary,
                                secondary,
                                accent,
                                text: '#ffffff' // Keep text white for contrast on dark
                            });
                        })
                        .catch(err => {
                            console.warn("Color extraction failed:", err);
                            // Fallback to a distinct color to prove it tried (e.g., dark blue)
                            setThemeColors({
                                primary: '#0d1b2a',
                                secondary: '#1b263b',
                                accent: '#415a77',
                                text: '#ffffff'
                            });
                        });
                }).catch(err => console.warn("Vibrant import failed:", err));
            } else {
                // Reset to default
                setThemeColors({
                    primary: '#121212',
                    secondary: '#282828',
                    accent: 'var(--dynamic-accent)',
                    text: '#ffffff'
                });
            }

            if (audioRef.current) {
                let streamUrl = '';

                if (currentTrack.filepath) {
                    streamUrl = getStorageUrl(currentTrack.filepath);
                } else {
                    // For legacy streaming or when no explicit filepath
                    const { hostname } = window.location;
                    const PORT = 3000;
                    const PROTOCOL = 'http';
                    const API_URL = (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.'))
                        ? `${PROTOCOL}://${hostname}:${PORT}`
                        : '';
                    streamUrl = `${API_URL}/api/music/stream/${currentTrack.id}`;
                }

                console.log(`[Player] Tentando tocar: ${currentTrack.title} (${currentTrack.id})`);
                console.log(`[Player] URL: ${streamUrl}`);

                audioRef.current.src = streamUrl;

                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch(e => {
                            console.error("Erro no play:", e);
                            setIsPlaying(false);
                            // Tentar identificar o erro
                            if (e.name === 'NotAllowedError') {
                                addToast("Clique no play novamente para habilitar o áudio.", "info");
                            } else {
                                addToast("Erro ao tocar música. Verifique o console.", "error");
                            }
                        });
                }
            }
        }
    }, [currentTrack]);

    const playTrack = (track) => {
        if (!track) return;
        setCurrentTrack(track);
        // setIsPlaying(true); // O play() async vai setar true
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Erro no togglePlay:", e));
            setIsPlaying(true);
        }
    };

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const changeVolume = (vol) => {
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolume(vol);
        }
    };

    // Advanced Controls

    const toggleShuffle = () => {
        if (!shuffle) {
            // Turn On
            setOriginalPlaylist([...playlist]);
            // Shuffle but keep current track first
            const newPlaylist = [...playlist];
            if (currentTrack) {
                const currentIdx = newPlaylist.findIndex(t => t.id === currentTrack.id);
                if (currentIdx !== -1) {
                    newPlaylist.splice(currentIdx, 1);
                }
            }
            // Fisher-Yates shuffle
            for (let i = newPlaylist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newPlaylist[i], newPlaylist[j]] = [newPlaylist[j], newPlaylist[i]];
            }
            if (currentTrack) {
                newPlaylist.unshift(currentTrack);
            }
            setPlaylist(newPlaylist);
            setShuffle(true);
            addToast("Aleatório ativado", "info");
        } else {
            // Turn Off
            if (originalPlaylist.length > 0) {
                setPlaylist(originalPlaylist);
            }
            setShuffle(false);
            addToast("Aleatório desativado", "info");
        }
    };

    const toggleRepeat = () => {
        if (repeatMode === 'off') {
            setRepeatMode('all');
            addToast("Repetir Playlist", "info");
        } else if (repeatMode === 'all') {
            setRepeatMode('one');
            addToast("Repetir Música", "info");
        } else {
            setRepeatMode('off');
            addToast("Repetir Desativado", "info");
        }
    };

    const playNext = () => {
        if (playlist.length === 0) return;
        const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);

        if (currentIndex === -1 || currentIndex === playlist.length - 1) {
            // End of playlist
            if (repeatMode === 'all' || (repeatMode === 'one' && !shuffle)) {
                playTrack(playlist[0]);
            } else {
                if (repeatMode === 'off') {
                    setIsPlaying(false);
                }
            }
        } else {
            playTrack(playlist[currentIndex + 1]);
        }
    };

    const playPrevious = () => {
        if (playlist.length === 0) return;
        // If > 3 seconds, replay current
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex === -1 || currentIndex === 0) {
            if (repeatMode === 'all') {
                playTrack(playlist[playlist.length - 1]);
            }
        } else {
            playTrack(playlist[currentIndex - 1]);
        }
    };

    // Auto-advance
    const handleTrackEnded = () => {
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            playNext();
        }
    };

    // const { addToast } = useToast(); // Já declarado acima

    const addToPendrive = (track) => {
        // Verificar duplicatas no pendriveItems
        if (!pendriveItems.find(item => item.id === track.id)) {
            const newList = [...pendriveItems, track];
            setPendriveItems(newList);
            // Salvar no localStorage também para persistir
            localStorage.setItem('pendrive', JSON.stringify(newList));
            addToast(`"${track.title}" adicionada ao drive!`, 'success');
        } else {
            addToast(`"${track.title}" já está no drive.`, 'info');
        }
    };

    const removeFromPendrive = (trackId) => {
        setPendriveItems(pendriveItems.filter(i => i.id !== trackId));
        addToast('Música removida do drive.', 'info');
    };

    const addBatchToPendrive = (tracks) => {
        const newTracks = tracks.filter(track => !pendriveItems.find(item => item.id === track.id));

        if (newTracks.length > 0) {
            const newList = [...pendriveItems, ...newTracks];
            setPendriveItems(newList);
            localStorage.setItem('pendrive', JSON.stringify(newList));
            addToast(`${newTracks.length} músicas adicionadas ao drive!`, 'success');
        } else {
            addToast('Todas as músicas já estão no drive.', 'info');
        }
    };


    const removeAlbumFromPendrive = (albumName) => {
        const initialCount = pendriveItems.length;
        const newItems = pendriveItems.filter(i => i.album !== albumName);
        const removedCount = initialCount - newItems.length;

        if (removedCount > 0) {
            setPendriveItems(newItems);
            addToast(`${removedCount} músicas removidas do drive.`, 'info');
        }
    };

    const clearPendrive = () => {
        setPendriveItems([]);
        addToast('Pen Drive limpo!', 'info');
    };

    const value = {
        currentTrack,
        isPlaying,
        playlist,
        setPlaylist, // Exposing setPlaylist
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        shuffle,
        repeatMode,
        audioRef,
        pendriveItems,
        addToPendrive,
        addBatchToPendrive,
        removeFromPendrive,
        removeAlbumFromPendrive,
        clearPendrive,
        currentTime,
        duration,
        volume,
        seek,
        changeVolume,
        analyserRef,
        carMode,
        setCarMode,
        themeColors
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
            <audio ref={audioRef} onEnded={handleTrackEnded} crossOrigin="anonymous" />
        </PlayerContext.Provider>
    );
};
