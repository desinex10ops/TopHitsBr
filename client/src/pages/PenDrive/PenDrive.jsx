import * as React from 'react';
const { useState } = React;
import { usePlayer } from '../../contexts/PlayerContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import styles from './PenDrive.module.css';

const PenDrive = () => {
    const { pendriveItems, removeFromPendrive, removeAlbumFromPendrive, clearPendrive } = usePlayer();
    const { addToast } = useToast();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (pendriveItems.length === 0) return;
        setDownloading(true);
        addToast('Preparando seu Pen Drive... aguarde.', 'info');

        try {
            const trackIds = pendriveItems.map(t => t.id);

            const response = await api.post('/music/pendrive', { trackIds }, {
                responseType: 'blob',
                timeout: 120000
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'TopHitsBr_PenDrive.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();

            addToast('Download iniciado com sucesso!', 'success');

        } catch (error) {
            console.error("Erro no download:", error);
            addToast('Erro ao gerar Pen Drive. Tente novamente.', 'error');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '20px' }}>
            <div className={styles.header}>
                <h2>Meu Pen Drive ({pendriveItems.length})</h2>
                {pendriveItems.length > 0 && (
                    <div className={styles.actions}>
                        <button onClick={clearPendrive} className={styles.clearBtn} disabled={downloading}>Limpar</button>
                        <button onClick={handleDownload} className={styles.downloadBtn} disabled={downloading}>
                            {downloading ? 'Gerando ZIP...' : '⬇ Baixar Tudo'}
                        </button>
                    </div>
                )}
            </div>

            {pendriveItems.length === 0 ? (
                <div className={styles.empty}>
                    <p>Seu Pen Drive está vazio. Adicione músicas!</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {/* Group items by Album */}
                    {Object.entries(pendriveItems.reduce((groups, track) => {
                        const albumName = track.album || 'Sem Álbum';
                        if (!groups[albumName]) groups[albumName] = [];
                        groups[albumName].push(track);
                        return groups;
                    }, {})).map(([albumName, tracks]) => (
                        <div key={albumName} style={{ marginBottom: '20px', background: '#222', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* Album Header */}
                            <div style={{
                                padding: '10px 15px',
                                background: '#333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{albumName} ({tracks.length})</h3>
                                <button
                                    onClick={() => removeAlbumFromPendrive(albumName)}
                                    style={{
                                        background: '#ff4444', border: 'none', color: 'white',
                                        padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                    }}
                                >
                                    Remover Álbum
                                </button>
                            </div>

                            {/* Tracks */}
                            <div>
                                {tracks.map(track => (
                                    <div key={track.id} className={styles.item} style={{ borderBottom: '1px solid #333' }}>
                                        <div className={styles.info}>
                                            <span className={styles.title}>{track.title}</span>
                                            <span className={styles.artist}>{track.artist}</span>
                                        </div>
                                        <button onClick={() => removeFromPendrive(track.id)} className={styles.removeBtn}>❌</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PenDrive;
