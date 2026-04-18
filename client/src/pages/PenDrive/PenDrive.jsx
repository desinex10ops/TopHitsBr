import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMusic } from 'react-icons/fi';
import styles from './PenDrive.module.css';

const PenDrive = () => {
    const { pendriveItems, removeFromPendrive, removeAlbumFromPendrive, clearPendrive, addToPendrive } = usePlayer();
    const { addToast } = useToast();
    const [downloading, setDownloading] = useState(false);

    // Settings State
    const [structure, setStructure] = useState('artist_album');
    const [convertTo, setConvertTo] = useState('original');
    const [capacity, setCapacity] = useState(4 * 1024 * 1024 * 1024); // 4GB default
    const [showSettings, setShowSettings] = useState(false); // Toggle settings

    // Smart Fill State
    const [filling, setFilling] = useState(false);
    const [smartStrategy, setSmartStrategy] = useState('top_played'); // 'top_played', 'recent', 'random', 'vibe'
    const [vibe, setVibe] = useState(''); // Text input for vibe
    const navigate = useNavigate(); // For search redirection if needed

    // Calculate usage
    const usedBytes = pendriveItems.reduce((acc, item) => acc + (item.duration ? item.duration * 40 * 1024 : 8 * 1024 * 1024), 0);
    const usedPercentage = Math.min((usedBytes / capacity) * 100, 100);

    const formatSize = (bytes) => {
        if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    };

    const handleSmartFill = async () => {
        setFilling(true);
        try {
            const emptySpace = capacity - usedBytes;
            if (emptySpace <= 0) {
                addToast('Seu Pen Drive já está cheio!', 'warning');
                return;
            }
            const limitBytes = Math.floor(emptySpace / (1024 * 1024));

            let url = `/music/pendrive/smart-fill?limitBytes=${limitBytes}&strategy=${smartStrategy}`;
            if (smartStrategy === 'vibe' && vibe) {
                url += `&vibe=${encodeURIComponent(vibe)}`;
            }

            const response = await api.get(url);
            const newTracks = response.data.tracks;
            const currentIds = new Set(pendriveItems.map(t => t.id));
            const uniqueTracks = newTracks.filter(t => !currentIds.has(t.id));

            if (uniqueTracks.length === 0) {
                addToast('Não encontramos mais músicas para adicionar.', 'info');
            } else {
                uniqueTracks.forEach(track => addToPendrive(track));
                addToast(`${uniqueTracks.length} músicas adicionadas!`, 'success');
            }
        } catch (error) {
            console.error("Smart Fill Error:", error);
            addToast('Erro ao completar Pen Drive.', 'error');
        } finally {
            setFilling(false);
        }
    };

    const handleDownload = async () => {
        if (pendriveItems.length === 0) return;
        setDownloading(true);
        addToast('Gerando Pen Drive... aguarde.', 'info');

        try {
            const trackIds = pendriveItems.map(t => t.id);
            const response = await api.post('/music/pendrive', {
                trackIds, structure, convertTo
            }, {
                responseType: 'blob',
                timeout: 300000
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'TopHitsBr_PenDrive.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
            addToast('Download iniciado!', 'success');
        } catch (error) {
            console.error("Erro no download:", error);
            addToast('Erro ao gerar Pen Drive.', 'error');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainGrid}>
                {/* Left Column */}
                <div className={styles.leftCol}>
                    <div className={styles.heroHeader}>
                        <h1>ATUALIZE SEU PEN DRIVE</h1>
                        <p>SIMPLES, RÁPIDO E GRÁTIS</p>
                    </div>

                    <div className={styles.smartFillControls}>
                        <div className={styles.controlGroup}>
                            <label>Estratégia:</label>
                            <select value={smartStrategy} onChange={(e) => setSmartStrategy(e.target.value)} className={styles.strategySelect}>
                                <option value="top_played">🔥 Mais Tocadas</option>
                                <option value="recent">🆕 Lançamentos</option>
                                <option value="random">🎲 Aleatórias</option>
                                <option value="vibe">✨ Por Vibe/Estilo</option>
                            </select>
                        </div>

                        {smartStrategy === 'vibe' && (
                            <input
                                type="text"
                                placeholder="Ex: Paredão, Funk, Relax..."
                                value={vibe}
                                onChange={(e) => setVibe(e.target.value)}
                                className={styles.vibeInput}
                            />
                        )}

                        <button className={styles.smartBtn} onClick={handleSmartFill} disabled={filling}>
                            {filling ? 'Montando...' : 'Completar Pen Drive ⚡'}
                        </button>
                    </div>

                    <div className={styles.navTabs}>
                        <button className={`${styles.tabBtn} ${styles.activeTab}`}>
                            Músicas Selecionadas ({pendriveItems.length})
                        </button>
                    </div>

                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Pesquisar na lista..." />
                        <FiSearch />
                    </div>

                    {/* Track List */}
                    <div className={styles.trackList}>
                        {pendriveItems.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>Sua lista está vazia.</p>
                                <span>Adicione músicas do site ou use o "Montar Músicas".</span>
                            </div>
                        ) : (
                            pendriveItems.map(track => (
                                <div key={track.id} className={styles.trackItem}>
                                    <div className={styles.trackInfo}>
                                        <span className={styles.trackTitle}>{track.title}</span>
                                        <span className={styles.trackArtist}>{track.artist}</span>
                                    </div>
                                    <div className={styles.trackMeta}>
                                        <span>{formatSize(track.duration ? track.duration * 40 * 1024 : 8 * 1024 * 1024)}</span>
                                        <button onClick={() => removeFromPendrive(track.id)} className={styles.removeBtn}>✕</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column (Card) */}
                <div className={styles.rightCol}>
                    <div className={styles.pendriveCard}>
                        <div className={styles.cardHeader}>
                            <h3>MEU PEN DRIVE</h3>
                            <div className={styles.usbConnector}>
                                <div className={styles.usbMetal}>
                                    <div className={styles.usbHoles}></div>
                                    <div className={styles.usbHoles}></div>
                                </div>
                                <div className={styles.usbBody}>
                                    <div className={styles.capacityBarWrapper}>
                                        <div
                                            className={styles.capacityBar}
                                            style={{ width: `${usedPercentage}%`, backgroundColor: usedPercentage > 90 ? '#ff4444' : 'var(--dynamic-accent)' }}
                                        />
                                    </div>
                                    <span className={styles.usbLabel}>{formatSize(usedBytes)} / {formatSize(capacity)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            {pendriveItems.length === 0 ? (
                                <p className={styles.cardMsg}>Seu pen drive está vazio.<br />Adicione álbuns ou músicas!</p>
                            ) : (
                                <p className={styles.cardMsg}>
                                    {pendriveItems.length} faixas selecionadas.<br />
                                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Ocupando {formatSize(usedBytes)} de {formatSize(capacity)}</span>
                                </p>
                            )}

                            <button onClick={handleDownload} className={styles.downloadBigBtn} disabled={downloading || pendriveItems.length === 0}>
                                {downloading ? 'PROCESSANDO...' : 'BAIXAR PEN DRIVE'}
                            </button>

                            {pendriveItems.length > 0 && (
                                <button onClick={clearPendrive} className={styles.textBtn}>Limpar Lista</button>
                            )}
                        </div>

                        <div className={styles.cardFooter}>
                            <span>TOP HITS BRASIL • 2026</span>
                        </div>

                        {/* Settings Toggle */}
                        <div className={styles.settingsToggle} onClick={() => setShowSettings(!showSettings)}>
                            {showSettings ? 'Ocultar Configurações' : 'Configurações do Pen Drive'}
                        </div>

                        {showSettings && (
                            <div className={styles.settingsArea}>
                                <div className={styles.settingRow}>
                                    <label>Capacidade:</label>
                                    <select value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}>
                                        <option value={2 * 1024 * 1024 * 1024}>2 GB</option>
                                        <option value={4 * 1024 * 1024 * 1024}>4 GB</option>
                                        <option value={8 * 1024 * 1024 * 1024}>8 GB</option>
                                    </select>
                                </div>
                                <div className={styles.settingRow}>
                                    <label>Pastas:</label>
                                    <select value={structure} onChange={(e) => setStructure(e.target.value)}>
                                        <option value="artist_album">Artista/Álbum</option>
                                        <option value="genre">Gênero</option>
                                        <option value="root">Sem Pastas</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PenDrive;
