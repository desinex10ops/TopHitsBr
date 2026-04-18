import React, { useState, useCallback } from 'react';
import api from '../../services/api';
import styles from './Upload.module.css';
import { useToast } from '@/contexts/ToastContext';
import BoostBlock from '../../components/BoostBlock/BoostBlock';
import { parseBlob } from 'music-metadata-browser';
import { FiUploadCloud, FiMusic, FiPackage, FiX, FiCheck } from 'react-icons/fi';

// Componente Principal de Upload
const Upload = () => {
    const [mode, setMode] = useState('single'); // 'single' | 'album'
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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
        processFile(file, e.target.name);
    };

    // Drag & Drop Handlers
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];

            if (mode === 'single' && file.type.startsWith('audio/')) {
                await processFile(file, 'audio');
            } else if (mode === 'album' && (file.name.endsWith('.zip') || file.name.endsWith('.rar'))) {
                processFile(file, 'zip');
            } else if (file.type.startsWith('image/')) {
                processFile(file, 'cover');
            } else {
                addToast('Formato de arquivo inválido para este modo.', 'error');
            }
        }
    }, [mode]);

    const processFile = async (file, type) => {
        if (type === 'cover') {
            setFiles(prev => ({ ...prev, cover: file }));
            setPreviews(prev => ({ ...prev, cover: URL.createObjectURL(file) }));
        } else if (type === 'zip') {
            setFiles(prev => ({ ...prev, zip: file }));
        } else if (type === 'audio') {
            setFiles(prev => ({ ...prev, audio: file }));
            // Extract Metadata
            try {
                const metadata = await parseBlob(file);
                const { common, format } = metadata;

                setFormData(prev => ({
                    ...prev,
                    title: common.title || file.name.replace(/\.[^/.]+$/, ""),
                    artist: common.artist || prev.artist,
                    album: common.album || prev.album,
                    genre: common.genre ? common.genre[0] : prev.genre,
                }));

                // Extract Cover Art from MP3 if exists and no cover selected yet
                if (common.picture && common.picture.length > 0 && !files.cover) {
                    const pic = common.picture[0];
                    const blob = new Blob([pic.data], { type: pic.format });
                    const coverUrl = URL.createObjectURL(blob);
                    setPreviews(prev => ({ ...prev, cover: coverUrl }));
                    // Conversion to File object might be needed for upload, 
                    // but for now let's just show preview. 
                    // To upload we'd need to append this blob to FormData.
                    setFiles(prev => ({ ...prev, cover: new File([blob], "cover.jpg", { type: pic.format }) }));
                }

                addToast('Metadados extraídos com sucesso!', 'success');
            } catch (error) {
                console.warn("Erro ao ler metadados:", error);
                // Fallback to filename
                setFormData(prev => ({
                    ...prev,
                    title: file.name.replace(/\.[^/.]+$/, "")
                }));
            }
        }
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        if (!files.zip) return addToast('Selecione um arquivo ZIP/RAR.', 'info');

        setLoading(true);
        setPreviewTracks([]);
        setTempId(null);
        setPreviewMode(false);

        const data = new FormData();
        data.append('file', files.zip);
        if (files.cover) data.append('cover', files.cover);

        try {
            const res = await api.post('/music/preview-album', data);
            setTempId(res.data.tempId);
            setPreviewTracks(res.data.tracks.map(track => ({ ...track, selected: true })));
            setPreviewMode(true);
            addToast('Álbum analisado! Revise as músicas.', 'success');
        } catch (error) {
            console.error("Erro no Preview:", error);
            const errorMsg = error.response?.data?.error || error.message || 'Erro desconhecido.';
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
        if (selectedTracks.length === 0) return addToast('Selecione pelo menos uma música.', 'info');

        setLoading(true);
        const data = new FormData();

        data.append('tempId', tempId);
        data.append('tracks', JSON.stringify(previewTracks));
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
            resetForm();
        } catch (error) {
            console.error(error);
            addToast('Erro ao confirmar upload.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'single') {
            if (!files.audio || !formData.title || !formData.artist) {
                return addToast('Música, Título e Artista são obrigatórios.', 'info');
            }

            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (files.cover) data.append('cover', files.cover);
            if (files.audio) data.append('audio', files.audio);

            try {
                await api.post('/music/upload', data);
                addToast('Música enviada com sucesso!', 'success');
                resetForm();
            } catch (error) {
                console.error(error);
                addToast(error.response?.data?.error || 'Erro ao enviar música.', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            handlePreview(e);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', artist: '', album: '', genre: '', vibe: '', composer: '', instagram: '', youtubeLink: '', isExplicit: false });
        setFiles({ audio: null, cover: null, zip: null });
        setPreviews({ cover: null });
        setPreviewMode(false);
        setPreviewTracks([]);
        setTempId(null);
    };

    return (
        <div className={styles.container}>
            <BoostBlock />

            <div className={styles.header}>
                <h2>Central de Upload</h2>
                <p>Arraste, solte e lance seu hit.</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${mode === 'single' ? styles.activeTab : ''}`}
                    onClick={() => { setMode('single'); setPreviewMode(false); }}
                >
                    <FiMusic /> Música Única
                </button>
                <button
                    className={`${styles.tab} ${mode === 'album' ? styles.activeTab : ''}`}
                    onClick={() => { setMode('album'); setPreviewMode(false); }}
                >
                    <FiPackage /> Álbum Completo (ZIP)
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.uploadCard} onDragEnter={handleDrag}>

                {/* Drag Overlay */}
                {dragActive && (
                    <div className={styles.dragOverlay} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                        <div className={styles.dragContent}>
                            <FiUploadCloud size={80} color="var(--dynamic-accent)" />
                            <h3>Solte seu arquivo aqui</h3>
                            <p>Detectaremos os metadados automaticamente.</p>
                        </div>
                    </div>
                )}

                {/* Preview Mode Album */}
                {mode === 'album' && previewMode ? (
                    <div style={{ width: '100%' }}>
                        <h3 style={{ color: 'white', marginBottom: '20px' }}>Revisar Faixas do Álbum</h3>
                        <div className={styles.trackList}>
                            {previewTracks.map((track, idx) => (
                                <div key={idx} className={`${styles.trackItem} ${track.selected ? styles.selected : ''}`}>
                                    <span className={styles.trackIndex}>{idx + 1}.</span>
                                    <input
                                        type="text"
                                        value={track.title}
                                        onChange={(e) => handleTrackTitleChange(idx, e.target.value)}
                                        className={styles.trackInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleTrackSelection(idx)}
                                        className={styles.trackAction}
                                    >
                                        {track.selected ? <FiX /> : <FiCheck />}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button type="button" onClick={resetForm} className={styles.backBtn}>Cancelar</button>
                            <button type="button" onClick={handleConfirmUpload} className={styles.confirmBtn} disabled={loading}>
                                {loading ? 'Publicando...' : 'Publicar Álbum'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Left Column: Cover */}
                        <div className={styles.coverSection}>
                            <label
                                className={styles.coverUploadLabel}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {previews.cover ? (
                                    <img src={previews.cover} alt="Preview" className={styles.coverPreview} />
                                ) : (
                                    <div className={styles.coverPlaceholder}>
                                        <FiMusic size={40} />
                                        <span>Adicionar Capa</span>
                                        <small>(Ou arraste aqui)</small>
                                    </div>
                                )}
                                <input type="file" name="cover" accept="image/*" onChange={handleFileChange} hidden />
                            </label>
                        </div>

                        {/* Right Column: Inputs */}
                        <div className={styles.formSection}>
                            {/* Drag Zone for Audio/Zip */}
                            <label
                                className={`${styles.fileDropZone} ${files.audio || files.zip ? styles.hasFile : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {mode === 'single' ? (
                                    files.audio ? (
                                        <div className={styles.fileInfo}>
                                            <FiMusic size={24} color="var(--dynamic-accent)" />
                                            <span>{files.audio.name}</span>
                                        </div>
                                    ) : (
                                        <div className={styles.dropText}>
                                            <FiUploadCloud size={30} />
                                            <span>Clique ou arraste o <strong>MP3</strong> aqui</span>
                                        </div>
                                    )
                                ) : (
                                    files.zip ? (
                                        <div className={styles.fileInfo}>
                                            <FiPackage size={24} color="var(--dynamic-accent)" />
                                            <span>{files.zip.name}</span>
                                        </div>
                                    ) : (
                                        <div className={styles.dropText}>
                                            <FiUploadCloud size={30} />
                                            <span>Clique ou arraste o <strong>ZIP</strong> aqui</span>
                                        </div>
                                    )
                                )}
                                <input
                                    type="file"
                                    name={mode === 'single' ? 'audio' : 'zip'}
                                    accept={mode === 'single' ? "audio/*" : ".zip,.rar,.7z"}
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </label>

                            <div className={styles.inputGrid}>
                                <input className={styles.inputField} type="text" name="artist" placeholder={mode === 'album' ? "Artista do Álbum" : "Artista *"} value={formData.artist} onChange={handleInputChange} required={mode === 'single'} />
                                <input className={styles.inputField} type="text" name="album" placeholder="Nome do Álbum" value={formData.album} onChange={handleInputChange} />
                            </div>

                            <div className={styles.inputGrid}>
                                <select className={styles.inputField} name="genre" value={formData.genre} onChange={handleInputChange}>
                                    <option value="">Gênero</option>
                                    <option value="Sertanejo">Sertanejo</option>
                                    <option value="Funk">Funk</option>
                                    <option value="Piseiro">Piseiro</option>
                                    <option value="Forró">Forró</option>
                                    <option value="Eletrônica">Eletrônica</option>
                                    <option value="Trap">Trap</option>
                                    <option value="Pagode">Pagode</option>
                                    <option value="Outro">Outro</option>
                                </select>
                                <select className={styles.inputField} name="vibe" value={formData.vibe} onChange={handleInputChange}>
                                    <option value="">Vibe</option>
                                    <option value="Paredão">🔊 Paredão</option>
                                    <option value="Rebaixado">🚗 Rebaixado</option>
                                    <option value="Churrasco">🥩 Churrasco</option>
                                    <option value="Sofrência">🍺 Sofrência</option>
                                    <option value="Treino">💪 Treino</option>
                                </select>
                            </div>

                            {mode === 'single' && (
                                <input className={styles.inputField} type="text" name="title" placeholder="Título da Música *" value={formData.title} onChange={handleInputChange} required />
                            )}

                            <div className={styles.extraSection}>
                                <h4 onClick={(e) => e.target.nextElementSibling.classList.toggle(styles.show)}>+ Opções Avançadas</h4>
                                <div className={styles.advancedOptions}>
                                    <div className={styles.inputGrid}>
                                        <input className={styles.inputField} type="text" name="instagram" placeholder="Instagram (@seuinsta)" value={formData.instagram} onChange={handleInputChange} />
                                        <input className={styles.inputField} type="text" name="youtubeLink" placeholder="Link YouTube" value={formData.youtubeLink} onChange={handleInputChange} />
                                    </div>
                                    <input className={styles.inputField} type="text" name="composer" placeholder="Compositor(a)" value={formData.composer} onChange={handleInputChange} />

                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" name="isExplicit" checked={formData.isExplicit} onChange={handleInputChange} />
                                        <span>Conteúdo Explícito (+18)</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className={styles.actionBtn}>
                                {loading ? 'Enviando...' : (mode === 'single' ? 'Lançar Música' : 'Analisar ZIP')}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default Upload;
