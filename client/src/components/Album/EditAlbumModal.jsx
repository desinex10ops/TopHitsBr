import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useState } = React;
import { FiX, FiUpload, FiFilm, FiImage, FiSave } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import styles from './EditAlbumModal.module.css'; // We'll create this

const EditAlbumModal = ({ album, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const [title, setTitle] = useState(album.title);
    const [genre, setGenre] = useState(album.genre || '');
    const [description, setDescription] = useState(album.description || '');
    const [coverFile, setCoverFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Preview URLs
    const getPreviewUrl = (file, existingPath) => {
        if (file) return URL.createObjectURL(file);
        if (existingPath) return getStorageUrl(existingPath);
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('genre', genre);
            formData.append('description', description);
            if (coverFile) formData.append('cover', coverFile);
            if (videoFile) formData.append('video', videoFile);

            await api.patch(`/music/album/${album.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addToast("Álbum atualizado!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            addToast("Erro ao atualizar álbum.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Editar Álbum</h3>
                    <button onClick={onClose}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.uploadSection}>
                            <label>Capa do Álbum</label>
                            <div className={styles.previewBox}>
                                {getPreviewUrl(coverFile, album.cover) ? (
                                    <img src={getPreviewUrl(coverFile, album.cover)} alt="Capa" />
                                ) : (
                                    <div className={styles.placeholder}><FiImage /></div>
                                )}
                            </div>
                            <label className={styles.fileBtn}>
                                <FiUpload /> Alterar Capa
                                <input type="file" onChange={e => setCoverFile(e.target.files[0])} accept="image/*" />
                            </label>
                        </div>

                        <div className={styles.uploadSection}>
                            <label>Vídeo de Fundo (Trailer)</label>
                            <div className={styles.previewBox}>
                                {getPreviewUrl(videoFile, album.video) ? (
                                    <video src={getPreviewUrl(videoFile, album.video)} controls />
                                ) : (
                                    <div className={styles.placeholder}><FiFilm /></div>
                                )}
                            </div>
                            <label className={styles.fileBtn}>
                                <FiUpload /> Alterar Vídeo
                                <input type="file" onChange={e => setVideoFile(e.target.files[0])} accept="video/*" />
                            </label>
                        </div>
                    </div>

                    <div className={styles.inputs}>
                        <label>Nome do Álbum</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />

                        <label>Gênero Principal</label>
                        <input
                            value={genre}
                            onChange={e => setGenre(e.target.value)}
                        />

                        <label>Descrição</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? 'Salvando...' : <><FiSave /> Salvar Alterações</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAlbumModal;
