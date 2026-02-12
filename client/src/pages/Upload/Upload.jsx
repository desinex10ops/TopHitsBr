import * as React from 'react';
const { useState } = React;
import api from '../../services/api';
import styles from './Upload.module.css';
import { useToast } from '../../contexts/ToastContext';
import BoostBlock from '../../components/BoostBlock/BoostBlock';

// Componente Principal de Upload
const Upload = () => {
    const [mode, setMode] = useState('single'); // 'single' | 'album'
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Estados Preview
    const [previewMode, setPreviewMode] = useState(false);
    const [previewTracks, setPreviewTracks] = useState([]);
    const [tempId, setTempId] = useState(null);

    // Estados
    const [formData, setFormData] = useState({ title: '', artist: '', album: '', genre: '', vibe: '', composer: '', instagram: '', youtubeLink: '', isExplicit: false });
    const [files, setFiles] = useState({ audio: null, cover: null, zip: null });
    const [previews, setPreviews] = useState({ cover: null });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const { name } = e.target;
        if (name === 'cover') {
            setFiles(prev => ({ ...prev, cover: file }));
            setPreviews(prev => ({ ...prev, cover: URL.createObjectURL(file) }));
        } else if (name === 'audio') {
            setFiles(prev => ({ ...prev, audio: file }));
        } else if (name === 'zip') {
            setFiles(prev => ({ ...prev, zip: file }));
        }
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        if (!files.zip) return addToast('Selecione um arquivo ZIP/RAR.', 'info');

        setLoading(true);
        // Limpar estado anterior para evitar mistura de uploads
        setPreviewTracks([]);
        setTempId(null);
        setPreviewMode(false);

        const data = new FormData();
        data.append('file', files.zip);
        if (files.cover) data.append('cover', files.cover); // Enviar capa para cachear

        try {
            const res = await api.post('/music/preview-album', data);
            setTempId(res.data.tempId);
            setPreviewTracks(res.data.tracks.map(track => ({ ...track, selected: true }))); // Default to selected
            setPreviewMode(true);
            addToast('Álbum analisado! Revise as músicas.', 'success');
        } catch (error) {
            console.error("Erro no Preview (Front):", error);
            const errorMsg = error.response?.data?.error || error.message || 'Erro desconhecido ao analisar álbum.';
            addToast(`Falha: ${errorMsg}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackTitleChange = (index, newTitle) => {
        const updated = [...previewTracks];
        updated[index].title = newTitle;
        setPreviewTracks(updated);
    };

    const toggleTrackSelection = (index) => {
        const updated = [...previewTracks];
        updated[index].selected = !updated[index].selected;
        setPreviewTracks(updated);
    };

    const handleConfirmUpload = async () => {
        const selectedTracks = previewTracks.filter(t => t.selected);
        if (selectedTracks.length === 0) return addToast('Selecione pelo menos uma música para publicar.', 'info');

        setLoading(true);
        const data = new FormData();

        data.append('tempId', tempId);
        data.append('tracks', JSON.stringify(previewTracks)); // Manda tudo, o backend filtra selected

        // Dados Globais
        data.append('defaultArtist', formData.artist);
        data.append('defaultAlbumName', formData.album);
        data.append('defaultGenre', formData.genre);
        data.append('defaultVibe', formData.vibe);
        data.append('defaultComposer', formData.composer || '');
        data.append('defaultInstagram', formData.instagram || '');
        data.append('defaultYoutubeLink', formData.youtubeLink || '');
        data.append('defaultIsExplicit', formData.isExplicit || false);

        try {
            await api.post('/music/confirm-album', data);
            addToast('Álbum publicado com sucesso!', 'success');
            // Reset Total
            setFormData({ title: '', artist: '', album: '', genre: '', vibe: '', composer: '', instagram: '', youtubeLink: '', isExplicit: false });
            setFiles({ audio: null, cover: null, zip: null });
            setPreviews({ cover: null });
            setPreviewMode(false);
            setPreviewTracks([]);
            setTempId(null);
        } catch (error) {
            console.error(error);
            addToast('Erro ao confirmar upload.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Modo Single segue normal
        if (mode === 'single') {
            if (!files.audio || !formData.title || !formData.artist) {
                return addToast('Música, Título e Artista são obrigatórios.', 'info');
            }

            setLoading(true);
            const data = new FormData();
            data.append('artist', formData.artist);
            data.append('album', formData.album);
            data.append('genre', formData.genre);
            data.append('vibe', formData.vibe);
            if (files.cover) data.append('cover', files.cover);

            data.append('title', formData.title);
            data.append('audio', files.audio);
            data.append('composer', formData.composer || '');
            data.append('instagram', formData.instagram || '');
            data.append('youtubeLink', formData.youtubeLink || '');
            data.append('isExplicit', formData.isExplicit || false);

            try {
                await api.post('/music/upload', data);
                addToast('Música enviada com sucesso!', 'success');
                setFormData({ title: '', artist: '', album: '', genre: '', vibe: '', composer: '', instagram: '', youtubeLink: '', isExplicit: false });
                setFiles({ audio: null, cover: null, zip: null });
                setPreviews({ cover: null });
            } catch (error) {
                console.error(error);
                addToast(error.response?.data?.error || error.message || 'Erro ao enviar música.', 'error');
            } finally {
                setLoading(false);
            }
        }
        // Modo Álbum -> Redireciona para Preview
        else {
            handlePreview(e);
        }
    };

    return (
        <div className={styles.container}>
            <BoostBlock />

            <div className={styles.header}>
                <h2>Central de Upload</h2>
                <p>Gerencie sua biblioteca de músicas com facilidade.</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${mode === 'single' ? styles.activeTab : ''}`}
                    onClick={() => { setMode('single'); setPreviewMode(false); }}
                >
                    🎵 Música Única
                </button>
                <button
                    className={`${styles.tab} ${mode === 'album' ? styles.activeTab : ''}`}
                    onClick={() => { setMode('album'); setPreviewMode(false); }} // Reset preview mode when switching to album tab
                >
                    📦 Álbum Completo (ZIP)
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.uploadCard}>

                {/* Preview Mode UI - Sobrepõe o form de álbum quando ativo */}
                {mode === 'album' && previewMode ? (
                    <div style={{ width: '100%' }}>
                        <h3 style={{ color: 'white', marginBottom: '20px' }}>Revisar Faixas do Álbum</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                            {previewTracks.map((track, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: track.selected ? '#222' : '#1a1a1a',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${track.selected ? '#4CAF50' : '#333'}`,
                                    opacity: track.selected ? 1 : 0.7
                                }}>
                                    <span style={{ color: '#666' }}>{idx + 1}.</span>
                                    <input
                                        type="text"
                                        value={track.title}
                                        onChange={(e) => handleTrackTitleChange(idx, e.target.value)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'white',
                                            flex: 1,
                                            fontSize: '1rem',
                                            borderBottom: '1px solid #444'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleTrackSelection(idx)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: track.selected ? '#ff4444' : '#666',
                                            fontSize: '1.2rem'
                                        }}
                                        title={track.selected ? "Excluir (Ignorar)" : "Restaurar"}
                                    >
                                        {track.selected ? '🗑️' : '➕'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button
                                type="button"
                                onClick={() => { setPreviewMode(false); setPreviewTracks([]); }}
                                className={styles.actionBtn}
                                style={{ background: '#333' }}
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmUpload}
                                className={styles.actionBtn}
                                disabled={loading}
                            >
                                {loading ? 'Publicando...' : 'Publicar Álbum'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* UI Normal do Upload (Capa + Form) */}
                        <div className={styles.coverSection}>
                            <label className={styles.coverUploadLabel}>
                                {previews.cover ? (
                                    <img src={previews.cover} alt="Preview" className={styles.coverPreview} />
                                ) : (
                                    <div className={styles.coverPlaceholder}>
                                        <span>📷</span>
                                        <span>Adicionar Capa</span>
                                    </div>
                                )}
                                <input type="file" name="cover" accept="image/*" onChange={handleFileChange} hidden />
                            </label>
                            <p className={styles.coverHint}>
                                {mode === 'album'
                                    ? 'Essa capa será aplicada a todas as músicas do álbum.'
                                    : 'Capa da música.'}
                            </p>
                        </div>

                        <div className={styles.formSection}>
                            {/* Campos Comuns (Artist, Album, Genre...) */}
                            <div className={styles.inputGroup}>
                                <input className={styles.inputField} type="text" name="artist" placeholder={mode === 'album' ? "Artista do Álbum (Opcional)" : "Artista *"} value={formData.artist} onChange={handleInputChange} required={mode === 'single'} />
                                <input className={styles.inputField} type="text" name="album" placeholder="Nome do Álbum" value={formData.album} onChange={handleInputChange} />
                            </div>
                            <div className={styles.inputGroup}>
                                <select className={styles.inputField} name="genre" value={formData.genre} onChange={handleInputChange}>
                                    <option value="">Selecione o Gênero</option>
                                    <option value="Sertanejo">Sertanejo</option>
                                    <option value="Funk">Funk</option>
                                    <option value="Piseiro">Piseiro</option>
                                    <option value="Forró">Forró</option>
                                    <option value="Eletrônica">Eletrônica</option>
                                    <option value="Outro">Outro</option>
                                </select>
                                <select className={styles.inputField} name="vibe" value={formData.vibe} onChange={handleInputChange}>
                                    <option value="">Vibe (Opcional)</option>
                                    <option value="Paredão">🔊 Paredão</option>
                                    <option value="Rebaixado">🚗 Rebaixado</option>
                                    <option value="Churrasco">🥩 Churrasco</option>
                                    <option value="Sofrência">🍺 Sofrência</option>
                                    <option value="Treino">💪 Treino</option>
                                </select>
                            </div>

                            {/* Single Fields */}
                            {mode === 'single' && (
                                <>
                                    <input className={styles.inputField} type="text" name="title" placeholder="Título da Música *" value={formData.title} onChange={handleInputChange} required />
                                    <label className={styles.fileDropZone}>
                                        {files.audio ? (
                                            <div className={styles.selectedFile}><span className={styles.fileName}>🎵 {files.audio.name}</span></div>
                                        ) : (
                                            <><span className={styles.dropIcon}>☁️</span><div className={styles.dropText}><strong>Clique para adicionar o MP3</strong></div></>
                                        )}
                                        <input type="file" name="audio" accept="audio/*" onChange={handleFileChange} hidden />
                                    </label>
                                </>
                            )}

                            {/* Album Fields */}
                            {mode === 'album' && (
                                <label className={styles.fileDropZone}>
                                    {files.zip ? (
                                        <div className={styles.selectedFile}><span className={styles.fileName}>📦 {files.zip.name}</span></div>
                                    ) : (
                                        <><span className={styles.dropIcon}>🗂️</span><div className={styles.dropText}><strong>Clique para adicionar o ZIP/RAR</strong></div></>
                                    )}
                                    <input type="file" name="zip" accept=".zip,.rar,.7z" onChange={handleFileChange} hidden />
                                </label>
                            )}

                            {/* Metadata Extra */}
                            <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>Mais Informações</h3>
                                <div className={styles.inputGroup} style={{ marginBottom: '15px' }}>
                                    <input className={styles.inputField} type="text" name="instagram" placeholder="Instagram (@seuinsta)" value={formData.instagram || ''} onChange={handleInputChange} />
                                    <input className={styles.inputField} type="text" name="youtubeLink" placeholder="Link YouTube" value={formData.youtubeLink || ''} onChange={handleInputChange} />
                                </div>
                                <div className={styles.inputGroup} style={{ marginBottom: '15px' }}>
                                    <input className={styles.inputField} type="text" name="composer" placeholder="Compositor(a)" value={formData.composer || ''} onChange={handleInputChange} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', cursor: 'pointer' }}>
                                        <input type="checkbox" name="isExplicit" checked={formData.isExplicit || false} onChange={handleInputChange} style={{ transform: 'scale(1.2)' }} />
                                        Conteúdo Explícito (+18)
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className={styles.actionBtn}>
                                {loading ? 'Processando...' : (mode === 'single' ? 'Enviar Música' : 'Analisar Álbum')}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default Upload;
