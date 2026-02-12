import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useState } = React;
import styles from './PenDriveWidget.module.css';
import api from '../../services/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { useToast } from '../../contexts/ToastContext';

const PenDriveWidget = () => {
    const [mode, setMode] = useState('album'); // 'album' | 'track'
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const { addToPendrive, removeFromPendrive, removeAlbumFromPendrive, pendriveItems, addBatchToPendrive } = usePlayer();
    const { addToast } = useToast();

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 2) {
            try {
                const res = await api.get(`/music?search=${term}`);
                setResults(res.data);
            } catch (error) {
                console.error(error);
            }
        } else {
            setResults([]);
        }
    };

    // Agrupar álbuns para o modo 'album'
    const albums = mode === 'album' ? Object.values(results.reduce((acc, track) => {
        const key = `${track.artist}-${track.album}`;
        if (!acc[key]) acc[key] = { ...track, tracks: [] };
        acc[key].tracks.push(track);
        return acc;
    }, {})) : [];

    const handleAddAlbum = (album) => {
        // No mundo real, buscaria todas as faixas do álbum. Aqui usamos as que vieram na busca.
        // Se a busca retornou poucas, pode ser incompleto. Ideal seria buscar tracks específicas do álbum.
        // Mas para simplificar UX "One Click":
        addToPendrive(album); // Adiciona a faixa representativa (ou fazer lógica de adicionar todas)
        addToast(`Álbum ${album.album} adicionado!`, 'success');
    };

    // Melhorando: Buscar e adicionar todas as faixas do álbum via API
    const handleAddFullAlbum = async (albumName) => {
        try {
            addToast(`Buscando faixas de "${albumName}"...`, 'info');
            const res = await api.get('/music', { params: { album: albumName } });
            const tracksToAdd = res.data;

            if (tracksToAdd.length > 0) {
                addBatchToPendrive(tracksToAdd);
            } else {
                addToast('Nenhuma música encontrada neste álbum.', 'warning');
            }
        } catch (error) {
            console.error(error);
            addToast('Erro ao buscar álbum.', 'error');
        }
    }

    const handleGenerate = async () => {
        if (pendriveItems.length === 0) return addToast('Adicione músicas primeiro!', 'error');

        const trackIds = pendriveItems.map(t => t.id);
        addToast('Gerando Pen Drive... Aguarde.', 'info');

        try {
            const response = await api.post('/music/pendrive', { trackIds }, {
                responseType: 'blob' // Importante para baixar arquivos
            });

            // Criar URL do Blob e forçar download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'TopHitsBr_PenDrive.zip');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            addToast('Download iniciado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao gerar Pen Drive.', 'error');
        }
    };

    return (
        <div className={styles.widget}>
            <div className={styles.mainHeader}>
                <div className={styles.titleColumn}>
                    <div className={styles.titleSection}>
                        <h2>Atualize Seu Pen Drive</h2>
                        <p>Simples, Rápido e Grátis</p>
                    </div>
                </div>

                <div className={styles.controlsColumn}>
                    <a href="#" className={styles.headerLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg> VER MEU PEN DRIVE
                    </a>

                    <div className={styles.modeSwitch}>
                        <button
                            className={`${styles.modeBtn} ${mode === 'album' ? styles.modeBtnActive : ''}`}
                            onClick={() => { setMode('album'); setResults([]); setSearchTerm(''); }}
                        >
                            Buscar por Álbum 💿
                        </button>
                        <button
                            className={`${styles.modeBtn} ${mode === 'track' ? styles.modeBtnActive : ''}`}
                            onClick={() => { setMode('track'); setResults([]); setSearchTerm(''); }}
                        >
                            Montar Músicas 🎵
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contentArea}>
                {/* Coluna Esquerda: Busca e Resultados */}
                <div className={styles.leftCol}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={mode === 'album' ? "Digite o nome do Artista ou Álbum..." : "Digite o nome da Música..."}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <span className={styles.inputArrow}>🔍</span>
                    </div>

                    {/* Resultados: Álbuns (Grid) ou Músicas (Lista) */}
                    <div className={styles.resultsArea}>
                        {mode === 'album' ? (
                            <div className={styles.albumGrid}>
                                {albums.map((album, idx) => (
                                    <div key={idx} className={styles.albumCard} onClick={() => handleAddFullAlbum(album.album)}>
                                        {album.coverpath ? (
                                            <img src={getStorageUrl(album.coverpath)} className={styles.albumCover} alt={album.album} />
                                        ) : (
                                            <div style={{ height: 140, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💿</div>
                                        )}
                                        <div className={styles.albumInfo}>
                                            <div className={styles.albumTitle}>{album.album}</div>
                                            <div className={styles.albumArtist}>{album.artist}</div>
                                        </div>
                                    </div>
                                ))}
                                {searchTerm && albums.length === 0 && <p style={{ color: '#666' }}>Nenhum álbum encontrado.</p>}
                            </div>
                        ) : (
                            <div className={styles.trackList}>
                                {results.map(track => (
                                    <div key={track.id} className={styles.trackItem}>
                                        <div className={styles.trackInfo}>
                                            <strong>{track.title}</strong>
                                            <span>{track.artist}</span>
                                        </div>
                                        <button className={styles.addTrackBtn} onClick={() => { addToPendrive(track); addToast('Adicionada!', 'success'); }}>
                                            + ADD
                                        </button>
                                    </div>
                                ))}
                                {searchTerm && results.length === 0 && <p style={{ color: '#666' }}>Nenhuma música encontrada.</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna Direita: Resumo do Pen Drive */}
                <div className={styles.rightCol}>
                    <div className={styles.queueHeader}>
                        <strong>Meu Pen Drive</strong>
                        <span style={{ color: '#1db954' }}>{pendriveItems.length} itens</span>
                    </div>

                    <div className={styles.queueList}>
                        {pendriveItems.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginTop: 20 }}>
                                Seu pen drive está vazio.<br />Adicione álbuns ou músicas!
                            </p>
                        ) : (
                            (() => {
                                // Agrupar itens para exibição
                                const groups = [];
                                const processedIds = new Set();

                                // Processar de trás para frente para manter ordem de inserção (mais recentes primeiro)
                                const reversedItems = pendriveItems.slice().reverse();

                                reversedItems.forEach(item => {
                                    if (processedIds.has(item.id)) return;

                                    if (item.album && item.album !== 'Singles') {
                                        // Verificar se é um album (tem mais de 1 musica desse album no pendrive?)
                                        const albumTracks = reversedItems.filter(t => t.album === item.album && t.artist === item.artist);

                                        if (albumTracks.length > 1) {
                                            // É um grupo de álbum
                                            // Verificar se já adicionamos este grupo (basta checar se o primeiro track desse grupo já foi processado)
                                            // Mas como estamos iterando, precisamos checar se JÁ adicionamos um grupo para esse album nesta iteração de render
                                            // Melhor estratégia: 
                                            // Find existing group in 'groups' array? No, simpler:
                                            // Se encontrarmos um item de album, coletamos TODOS desse album, marcamos IDs como processados, e adicionamos 1 card "Album"

                                            const groupKey = `${item.artist}-${item.album}`;
                                            const alreadyGrouped = groups.find(g => g.type === 'album' && g.key === groupKey);

                                            if (!alreadyGrouped) {
                                                groups.push({
                                                    type: 'album',
                                                    key: groupKey,
                                                    title: item.album,
                                                    artist: item.artist,
                                                    cover: item.coverpath,
                                                    tracks: albumTracks,
                                                    count: albumTracks.length
                                                });
                                                albumTracks.forEach(t => processedIds.add(t.id));
                                            }
                                        } else {
                                            // Apenas 1 música desse álbum, mostra como track normal?
                                            // O usuário pediu "Pasta do album". Se tiver 1 musica só, talvez mostre track normal.
                                            // Se ele adicionou "CD Inteiro", vai ter varias.
                                            groups.push({ type: 'track', data: item });
                                            processedIds.add(item.id);
                                        }
                                    } else {
                                        // Singles ou sem album
                                        groups.push({ type: 'track', data: item });
                                        processedIds.add(item.id);
                                    }
                                });

                                return groups.map((group, idx) => (
                                    <div key={idx} className={styles.queueItem} style={group.type === 'album' ? { borderLeft: '3px solid #1db954', backgroundColor: '#2a2a2a' } : {}}>
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                            {group.type === 'album' ? (
                                                <>
                                                    <span style={{ fontSize: '1.2rem', marginRight: 10 }}>📁</span>
                                                    {group.cover && (
                                                        <img
                                                            src={getStorageUrl(group.cover)}
                                                            alt=""
                                                            style={{ width: '30px', height: '30px', borderRadius: '4px', marginRight: '10px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                        <span className={styles.queueTitle} title={group.title}>{group.title}</span>
                                                        <span style={{ fontSize: '0.7em', color: '#999' }}>{group.artist} • {group.count} faixas</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={styles.checkIcon}>✓</span>
                                                    {group.data.coverpath && (
                                                        <img
                                                            src={getStorageUrl(group.data.coverpath)}
                                                            alt=""
                                                            style={{ width: '30px', height: '30px', borderRadius: '4px', marginRight: '10px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <span className={styles.queueTitle}>{group.data.title}</span>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (group.type === 'album') {
                                                    // Usar a função otimizada do contexto para remover álbum
                                                    removeAlbumFromPendrive(group.title);
                                                } else {
                                                    removeFromPendrive(group.data.id);
                                                }
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#666',
                                                cursor: 'pointer',
                                                padding: '5px',
                                                marginLeft: '10px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Remover"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ));
                            })()
                        )}
                    </div>

                    <button className={styles.actionBtn} onClick={handleGenerate}>
                        BAIXAR PEN DRIVE
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 15, fontSize: '0.7rem', color: '#444' }}>
                        TOP HITS BRASIL • 2026
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PenDriveWidget;
