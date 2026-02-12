import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/Shop/ProductCard';
import styles from './ShopHome.module.css';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';

const ShopHome = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        sort: 'newest'
    });
    const { playTrack } = usePlayer(); // Assuming we use same player for previews? 
    // Actually, previews might be short. But using main player is better for persistence.
    // We'd need to adapt the track structure to play it.

    const { addToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.type !== 'all') params.type = filters.type;
            if (filters.sort) params.sort = filters.sort;

            const response = await api.get('/shop/products', { params });
            setProducts(response.data);
        } catch (error) {
            console.error(error);
            addToast('Erro ao carregar loja.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPreview = (product) => {
        if (!product.previewPath) return addToast('Sem preview disponível.', 'info');

        // Adapt product to track format expected by Player
        const track = {
            id: `preview-${product.id}`,
            title: `Preview: ${product.title}`,
            artist: product.Producer?.artisticName || 'TopHits Shop',
            album: 'Shop Preview',
            coverpath: product.coverPath,
            filepath: product.previewPath, // Player needs to handle this path (might need full URL adjustment)
            isPreview: true
        };
        playTrack(track);
    };

    const { addToCart } = useCart();

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>TopHits Market <span className={styles.betaBadge}>BETA</span></h1>
                    <p className={styles.heroSubtitle}>Encontre tudo para sua produção musical.</p>
                    <div className={styles.heroActions}>
                        <button className={styles.heroCta} onClick={() => navigate('/register-producer')}>
                            Quero Vender
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar beats, packs..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>

                <div className={styles.filterPills}>
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'remix', label: 'Remix' },
                        { id: 'playback', label: 'Playback' },
                        { id: 'pack_dj', label: 'Pack DJ' },
                        { id: 'pack_artist', label: 'Pack Artista' },
                        { id: 'solo', label: 'Solos' },
                        { id: 'sample', label: 'Samples' },
                        { id: 'preset', label: 'Presets' }
                    ].map(type => (
                        <button
                            key={type.id}
                            className={`${styles.pill} ${filters.type === type.id ? styles.pillActive : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, type: type.id }))}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                <div className={styles.sortWrapper}>
                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                        className={styles.select}
                    >
                        <option value="newest">Mais Recentes</option>
                        <option value="popular">Mais Populares</option>
                        <option value="price_asc">Menor Preço</option>
                        <option value="price_desc">Maior Preço</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Carregando loja...</div>
            ) : (
                <div className={styles.grid}>
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onPlay={handlePlayPreview}
                                onAddToCart={handleAddToCart}
                            />
                        ))
                    ) : (
                        <div className={styles.empty}>Nenhum produto encontrado.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopHome;
