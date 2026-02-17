import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiMusic, FiUser, FiDisc, FiLayers, FiCheck } from 'react-icons/fi';
import api from '../../../services/api';
import { useToast } from '@/contexts/ToastContext';
import { getStorageUrl } from '../../../utils/urlUtils';
import styles from './EditTrackModal.module.css';

const EditTrackModal = ({ track, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        album: '',
        genre: '',
        vibe: ''
    });
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (track) {
            setFormData({
                title: track.title || '',
                artist: track.artist || '',
                album: track.album || '',
                genre: track.genre || '',
                vibe: track.vibe || ''
            });
            setCoverPreview(track.coverpath ? getStorageUrl(track.coverpath) : '');
        }
    }, [track]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (coverFile) {
            data.append('cover', coverFile);
        }

        try {
            const response = await api.patch(`/music/${track.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast('Música atualizada com sucesso!', 'success');
            onUpdate(response.data.track);
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar música:', error);
            addToast('Erro ao atualizar música.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Editar Música</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.mainGrid}>
                        <div className={styles.coverSection}>
                            <div className={styles.previewContainer}>
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover Preview" className={styles.coverImage} />
                                ) : (
                                    <div className={styles.placeholder}><FiDisc size={40} /></div>
                                )}
                            </div>
                            <label className={styles.uploadBtn}>
                                <FiUpload /> Trocar Capa
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div className={styles.inputsSection}>
                            <div className={styles.formGroup}>
                                <label><FiMusic /> Título</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label><FiUser /> Artista</label>
                                <input
                                    type="text"
                                    value={formData.artist}
                                    onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label><FiDisc /> Álbum</label>
                                <input
                                    type="text"
                                    value={formData.album}
                                    onChange={e => setFormData({ ...formData, album: e.target.value })}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label><FiLayers /> Gênero</label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Vibe</label>
                                    <input
                                        type="text"
                                        value={formData.vibe}
                                        onChange={e => setFormData({ ...formData, vibe: e.target.value })}
                                        placeholder="Paredão, Rebaixado..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTrackModal;
