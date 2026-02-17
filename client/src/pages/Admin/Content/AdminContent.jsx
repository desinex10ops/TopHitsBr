import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import styles from './AdminContent.module.css';
import { useToast } from '@/contexts/ToastContext';
import { FiTrash2, FiStar, FiSearch, FiCheck } from 'react-icons/fi';

const AdminContent = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('tracks'); // 'tracks' | 'albums'
    const { addToast } = useToast();

    useEffect(() => {
        fetchContent();
    }, [type]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Endpoint needs to be verified/created in backend
            const endpoint = type === 'tracks' ? '/admin/tracks' : '/admin/albums';
            const res = await api.get(endpoint);
            setItems(res.data);
        } catch (error) {
            console.error("Erro ao buscar conteúdo:", error);
            addToast('Erro ao carregar conteúdo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este item?")) return;

        try {
            await api.delete(`/admin/${type}/${id}`);
            setItems(items.filter(item => item.id !== id));
            addToast('Item excluído com sucesso.', 'success');
        } catch (error) {
            console.error("Erro ao excluir:", error);
            addToast('Erro ao excluir item.', 'error');
        }
    };

    const handleToggleFeature = async (item) => {
        try {
            const res = await api.patch(`/admin/${type}/${item.id}/feature`);
            setItems(items.map(i => i.id === item.id ? { ...i, featured: res.data.featured } : i));
            addToast(res.data.featured ? 'Item destacado!' : 'Destaque removido.', 'success');
        } catch (error) {
            console.error("Erro ao destacar:", error);
            addToast('Erro ao alterar destaque.', 'error');
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.artist.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.contentContainer}>
            <div className={styles.header}>
                <h2>Moderação de Conteúdo</h2>
                <div className={styles.filters}>
                    <div className={styles.typeToggle}>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="tracks">Músicas</option>
                            <option value="albums">Álbuns</option>
                        </select>
                    </div>
                    <div className={styles.searchBox} style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar por título ou artista..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.filterInput}
                        />
                        <FiSearch style={{ position: 'absolute', right: '10px', top: '10px', color: '#666' }} />
                    </div>
                </div>
            </div>

            {loading ? <p>Carregando...</p> : (
                <div className={styles.grid}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.card}>
                            <img src={item.coverUrl || '/default-cover.png'} alt={item.title} className={styles.cardImage} />
                            <div className={styles.cardInfo}>
                                <div className={styles.cardTitle} title={item.title}>{item.title}</div>
                                <div className={styles.cardArtist}>{item.artist}</div>

                                <div className={styles.actions}>
                                    <button
                                        className={`${styles.btn} ${item.featured ? styles.active : styles.featureBtn}`}
                                        onClick={() => handleToggleFeature(item)}
                                        title={item.featured ? "Remover Destaque" : "Destacar"}
                                    >
                                        <FiStar />
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.deleteBtn}`}
                                        onClick={() => handleDelete(item.id)}
                                        title="Excluir"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminContent;
