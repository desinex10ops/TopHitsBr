import React, { useState } from 'react';
import styles from './KaraokeModal.module.css';
import { FiX, FiUpload, FiMic } from 'react-icons/fi';

const KaraokeModal = ({ isOpen, onClose, onSave, track }) => {
    const [lyrics, setLyrics] = useState(track?.lyrics || '');
    const [instrumentalFile, setInstrumentalFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setInstrumentalFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        await onSave(track.id, lyrics, instrumentalFile);
        setUploading(false);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Gerenciar Karaokê: {track.title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fileSection}>
                        <label className={styles.fileLabel}>
                            <FiMic className={styles.icon} />
                            <span>{instrumentalFile ? instrumentalFile.name : 'Upload Instrumental (.mp3)'}</span>
                            <input type="file" accept="audio/*" onChange={handleFileChange} />
                        </label>
                        {track.karaokeFile && !instrumentalFile && (
                            <p className={styles.currentFile}>Arquivo atual: {track.karaokeFile.split('/').pop()}</p>
                        )}
                    </div>

                    <div className={styles.lyricsSection}>
                        <label>Letra Sincronizada (JSON ou LRC)</label>
                        <textarea
                            value={lyrics}
                            onChange={e => setLyrics(e.target.value)}
                            placeholder="Cole a letra aqui..."
                            rows={10}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
                        <button type="submit" disabled={uploading} className={styles.saveBtn}>
                            {uploading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KaraokeModal;
