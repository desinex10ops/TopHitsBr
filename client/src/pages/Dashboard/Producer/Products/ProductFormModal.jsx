import React, { useState, useRef } from 'react';
import styles from './ProductFormModal.module.css';
import { FiX, FiUploadCloud, FiMusic, FiImage, FiFile } from 'react-icons/fi';
import api from '@/services/api';
import { useToast } from '@/contexts/ToastContext';

const ProductFormModal = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        type: 'beat', // beat, kit, service
        category: '',
        bpm: '',
        tonality: '',
        description: '',
        tags: ''
    });

    const [files, setFiles] = useState({
        cover: null,
        preview: null,
        file: null
    });

    const fileInputRefs = {
        cover: useRef(null),
        preview: useRef(null),
        file: useRef(null)
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.price || !files.file) {
            return addToast("Preencha os campos obrigatórios e envie o arquivo principal.", "warning");
        }

        setLoading(true);
        const data = new FormData();

        // Append text fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Append tags as JSON array string
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        data.set('tags', JSON.stringify(tagsArray));

        // Append files
        if (files.cover) data.append('cover', files.cover);
        if (files.preview) data.append('preview', files.preview);
        if (files.file) data.append('file', files.file);

        try {
            await api.post('/shop/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast("Produto criado com sucesso!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            addToast("Erro ao criar produto.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <header className={styles.header}>
                    <h2>Novo Produto</h2>
                    <button onClick={onClose}><FiX /></button>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Título *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Trap Beat 2024"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Preço (R$) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Tipo</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="beat">Beat</option>
                                <option value="drumkit">Drum Kit</option>
                                <option value="loopkit">Loop Kit</option>
                                <option value="service">Serviço (Mix/Master)</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Gênero/Categoria</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Ex: Trap, Drill, R&B"
                            />
                        </div>
                    </div>

                    {formData.type === 'beat' && (
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>BPM</label>
                                <input type="number" name="bpm" value={formData.bpm} onChange={handleChange} placeholder="Ex: 140" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tonalidade</label>
                                <input type="text" name="tonality" value={formData.tonality} onChange={handleChange} placeholder="Ex: C Minor" />
                            </div>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>Descrição</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descreva seu produto..."
                            rows="3"
                        />
                    </div>

                    <div className={styles.fileSection}>
                        <h3>Arquivos</h3>

                        <div className={styles.fileInput} onClick={() => fileInputRefs.cover.current.click()}>
                            <FiImage />
                            <span>{files.cover ? files.cover.name : "Upload Capa (JPG/PNG)"}</span>
                            <input
                                type="file"
                                ref={fileInputRefs.cover}
                                onChange={e => handleFileChange(e, 'cover')}
                                accept="image/*"
                                hidden
                            />
                        </div>

                        <div className={styles.fileInput} onClick={() => fileInputRefs.preview.current.click()}>
                            <FiMusic />
                            <span>{files.preview ? files.preview.name : "Upload Preview (MP3) - Obrigatório para Beats"}</span>
                            <input
                                type="file"
                                ref={fileInputRefs.preview}
                                onChange={e => handleFileChange(e, 'preview')}
                                accept="audio/mpeg"
                                hidden
                            />
                        </div>

                        <div className={`${styles.fileInput} ${!files.file ? styles.required : ''}`} onClick={() => fileInputRefs.file.current.click()}>
                            <FiFile />
                            <span>{files.file ? files.file.name : "Upload Arquivo Principal (ZIP/WAV) *"}</span>
                            <input
                                type="file"
                                ref={fileInputRefs.file}
                                onChange={e => handleFileChange(e, 'file')}
                                accept=".zip,.rar,.wav,.mp3"
                                hidden
                            />
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? <span className={styles.spinner}></span> : <><FiUploadCloud /> Publicar Produto</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
