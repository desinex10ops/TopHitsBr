import React, { useState } from 'react';
import api from '../../../services/api';
import styles from './NewProductModal.module.css';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

const NewProductModal = ({ onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('details'); // details, metadata, files
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        type: 'remix',
        // [NEW]
        category: '',
        bpm: '',
        tonality: '',
        tags: '',
        stock: '', // Default infinite
        includedContent: ''
    });
    const [files, setFiles] = useState({
        cover: null,
        preview: null,
        file: null
    });
    const [uploading, setUploading] = useState(false);
    const { addToast } = useToast();

    // ... handleFileChange ... 
    const handleFileChange = (e, field) => {
        setFiles({ ...files, [field]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!files.file) return addToast('Você precisa enviar o arquivo do produto.', 'error');
        if (!formData.title || !formData.price) return addToast('Preencha os campos obrigatórios.', 'error');

        try {
            setUploading(true);
            const data = new FormData();
            // Append all fields
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    // tags needs to be array? Backend expects JSON string for tags array
                    if (key === 'tags') {
                        const tagArray = formData.tags.split(',').map(t => t.trim());
                        data.append(key, JSON.stringify(tagArray));
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            if (files.cover) data.append('cover', files.cover);
            if (files.preview) data.append('preview', files.preview);
            if (files.file) data.append('file', files.file);

            await api.post('/shop/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addToast('Produto criado com sucesso!', 'success');
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast('Erro ao criar produto.', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Novo Produto</h2>
                    <button onClick={onClose} className={styles.closeBtn}><FiX /></button>
                </div>

                <div className={styles.tabs}>
                    <button className={activeTab === 'details' ? styles.activeTab : ''} onClick={() => setActiveTab('details')}>Detalhes</button>
                    <button className={activeTab === 'metadata' ? styles.activeTab : ''} onClick={() => setActiveTab('metadata')}>Metadados</button>
                    <button className={activeTab === 'files' ? styles.activeTab : ''} onClick={() => setActiveTab('files')}>Arquivos</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {activeTab === 'details' && (
                        <>
                            <div className={styles.formGroup}>
                                <label>Título do Produto *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Alok Style Remix Pack"
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Preço (R$) *</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0,00"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tipo *</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="remix">Remix</option>
                                        <option value="playback">Playback</option>
                                        <option value="pack_dj">Pack DJ</option>
                                        <option value="pack_artist">Pack Artista</option>
                                        <option value="solo">Solo/Instrumental</option>
                                        <option value="sample">Sample Pack</option>
                                        <option value="preset">Preset VST</option>
                                        <option value="project">Projeto (FLP/ALS)</option>
                                        <option value="template">Template</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Descrição</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                ></textarea>
                            </div>
                        </>
                    )}

                    {activeTab === 'metadata' && (
                        <>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>BPM</label>
                                    <input type="number" value={formData.bpm} onChange={e => setFormData({ ...formData, bpm: e.target.value })} placeholder="Ex: 128" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tonalidade (Key)</label>
                                    <input type="text" value={formData.tonality} onChange={e => setFormData({ ...formData, tonality: e.target.value })} placeholder="Ex: Cm, F# Major" />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Gênero / Categoria</label>
                                <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Deep House" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tags (separadas por vírgula)</label>
                                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="House, Bass, Vocals" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Conteúdo Incluso</label>
                                <textarea value={formData.includedContent} onChange={e => setFormData({ ...formData, includedContent: e.target.value })} placeholder="Ex: 5 WAVs, 2 Midis..."></textarea>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Estoque (Deixe vazio para infinito)</label>
                                <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="-1" />
                            </div>
                        </>
                    )}

                    {activeTab === 'files' && (
                        <div className={styles.filesSection}>
                            <div className={styles.fileInput}>
                                <label><FiUploadCloud /> Capa (JPG/PNG)</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover')} />
                            </div>
                            <div className={styles.fileInput}>
                                <label><FiUploadCloud /> Preview de Áudio (MP3)</label>
                                <input type="file" accept="audio/*" onChange={e => handleFileChange(e, 'preview')} />
                            </div>
                            <div className={styles.fileInput} style={{ borderColor: '#1db954' }}>
                                <label style={{ color: '#1db954' }}><FiUploadCloud /> Arquivo do Produto (ZIP/RAR/MP3)</label>
                                <input type="file" required={!files.file} accept=".zip,.rar,.mp3,.wav" onChange={e => handleFileChange(e, 'file')} />
                                <small>Arquivo que o cliente irá baixar.</small>
                            </div>
                        </div>
                    )}

                    <div className={styles.footer}>
                        {activeTab !== 'files' ? (
                            <button type="button" className={styles.nextBtn} onClick={() => setActiveTab(activeTab === 'details' ? 'metadata' : 'files')}>Próximo</button>
                        ) : (
                            <button type="submit" className={styles.submitBtn} disabled={uploading}>
                                {uploading ? 'Enviando...' : 'Publicar Produto'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProductModal;
