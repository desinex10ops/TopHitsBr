import { useState, useEffect } from 'react';
import { FiPlus, FiTrash, FiSave, FiEdit2 } from 'react-icons/fi';
import styles from './AdminSettings.module.css'; // Reusing settings styles

const AdminFooterEditor = ({ footerData, onSave }) => {
    const [data, setData] = useState(footerData || {
        columns: [],
        socials: {},
        apps: {},
        text: '',
        copy: ''
    });

    useEffect(() => {
        if (footerData) {
            setData(typeof footerData === 'string' ? JSON.parse(footerData) : footerData);
        }
    }, [footerData]);

    const handleTextChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (key, value) => {
        setData({ ...data, socials: { ...data.socials, [key]: value } });
    };

    const handleAppChange = (key, value) => {
        setData({ ...data, apps: { ...data.apps, [key]: value } });
    };

    // --- Columns Logic ---
    const addColumn = () => {
        setData({
            ...data,
            columns: [...(data.columns || []), { title: 'Nova Coluna', links: [] }]
        });
    };

    const removeColumn = (index) => {
        const newCols = [...data.columns];
        newCols.splice(index, 1);
        setData({ ...data, columns: newCols });
    };

    const updateColumnTitle = (index, title) => {
        const newCols = [...data.columns];
        newCols[index].title = title;
        setData({ ...data, columns: newCols });
    };

    // --- Links Logic ---
    const addLink = (colIndex) => {
        const newCols = [...data.columns];
        newCols[colIndex].links.push({ label: 'Novo Link', url: '/' });
        setData({ ...data, columns: newCols });
    };

    const removeLink = (colIndex, linkIndex) => {
        const newCols = [...data.columns];
        newCols[colIndex].links.splice(linkIndex, 1);
        setData({ ...data, columns: newCols });
    };

    const updateLink = (colIndex, linkIndex, field, value) => {
        const newCols = [...data.columns];
        newCols[colIndex].links[linkIndex][field] = value;
        setData({ ...data, columns: newCols });
    };

    const save = () => {
        onSave(data);
    };

    return (
        <div className={styles.section} style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '30px' }}>
            <h2 className={styles.sectionTitle}>Rodapé do Site</h2>
            <p className={styles.hint}>Edite os links e conteúdos que aparecem no rodapé.</p>

            <div className={styles.inputGroup}>
                <label>Texto descritivo</label>
                <textarea
                    rows="3"
                    name="text"
                    value={data.text || ''}
                    onChange={handleTextChange}
                    className={styles.textarea}
                    placeholder="Descrição curta sobre o site..."
                    style={{ width: '100%', padding: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #333', borderRadius: '4px' }}
                />
            </div>

            <div className={styles.inputGroup}>
                <label>Copyright</label>
                <input
                    type="text"
                    name="copy"
                    value={data.copy || ''}
                    onChange={handleTextChange}
                    placeholder="© 2026 TopHitsBr..."
                />
            </div>

            <div className={styles.inputGroup}>
                <label>Redes Sociais e Apps</label>
                <div className={styles.grid2} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <h4>Sociais</h4>
                        <input type="text" placeholder="Instagram URL" value={data.socials?.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="Facebook URL" value={data.socials?.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="YouTube URL" value={data.socials?.youtube || ''} onChange={(e) => handleSocialChange('youtube', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="TikTok URL" value={data.socials?.tiktok || ''} onChange={(e) => handleSocialChange('tiktok', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="Twitter URL" value={data.socials?.twitter || ''} onChange={(e) => handleSocialChange('twitter', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                    </div>
                    <div>
                        <h4>Apps</h4>
                        <input type="text" placeholder="Android Link" value={data.apps?.android || ''} onChange={(e) => handleAppChange('android', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="iOS Link" value={data.apps?.ios || ''} onChange={(e) => handleAppChange('ios', e.target.value)} style={{ marginBottom: '10px', width: '100%' }} />
                    </div>
                </div>
            </div>

            <div className={styles.columnsEditor} style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Colunas de Links</h3>
                    <button className={styles.addBtn} onClick={addColumn}><FiPlus /> Nova Coluna</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {data.columns?.map((col, colIndex) => (
                        <div key={colIndex} style={{ background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    value={col.title}
                                    onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                                    placeholder="Título da Coluna"
                                    style={{ flex: 1 }}
                                />
                                <button onClick={() => removeColumn(colIndex)} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px' }}>
                                    <FiTrash />
                                </button>
                            </div>

                            <div style={{ paddingLeft: '20px' }}>
                                {col.links.map((link, linkIndex) => (
                                    <div key={linkIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => updateLink(colIndex, linkIndex, 'label', e.target.value)}
                                            placeholder="Nome do Link"
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => updateLink(colIndex, linkIndex, 'url', e.target.value)}
                                            placeholder="URL (/exemplo)"
                                            style={{ flex: 1 }}
                                        />
                                        <button onClick={() => removeLink(colIndex, linkIndex)} style={{ color: '#888', background: 'transparent', border: 'none' }}>
                                            <FiTrash />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addLink(colIndex)} style={{ background: 'transparent', color: '#1DB954', border: '1px dashed #1DB954', padding: '5px 10px', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    + Adicionar Link
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className={styles.saveBtn} style={{ marginTop: '30px', width: '100%', padding: '15px', fontSize: '1.1rem' }} onClick={save}>
                <FiSave /> Salvar Rodapé
            </button>
        </div>
    );
};

export default AdminFooterEditor;
