import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/Shop/ProductCard';
import styles from './ProducerStore.module.css';
import { FiInstagram, FiYoutube, FiGlobe, FiMapPin, FiUser } from 'react-icons/fi';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/contexts/CartContext';
import { getStorageUrl } from '../../utils/urlUtils';
import ChatModal from '../Dashboard/Chat/ChatModal';
import { useAuth } from '@/contexts/AuthContext';
import { FiMessageSquare } from 'react-icons/fi';

const ProducerStore = () => {
    const { username } = useParams();
    const [producer, setProducer] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack } = usePlayer();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        fetchStore();
    }, [username]);

    const fetchStore = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/shop/store/${username}`);
            setProducer(response.data.producer);
            setProducts(response.data.products);
        } catch (error) {
            console.error(error);
            addToast('Produtor não encontrado ou erro ao carregar.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPreview = (product) => {
        if (!product.previewPath) return addToast('Sem preview disponível.', 'info');

        const track = {
            id: `preview-${product.id}`,
            title: `Preview: ${product.title}`,
            artist: producer?.artisticName || 'TopHits Shop',
            album: 'Shop Preview',
            coverpath: product.coverPath,
            filepath: product.previewPath,
            isPreview: true
        };
        playTrack(track);
    };

    if (loading) return <div className={styles.loading}>Carregando loja...</div>;
    if (!producer) return <div className={styles.error}>Loja não encontrada.</div>;

    return (
        <div className={styles.container}>
            {/* Banner Section */}
            <div className={styles.banner}>
                {producer.bannerVideo ? (
                    <video
                        className={styles.bannerVideo}
                        src={getStorageUrl(producer.bannerVideo)}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <div
                        className={styles.bannerImage}
                        style={{ backgroundImage: `url(${getStorageUrl(producer.banner) || '/default_banner.jpg'})` }}
                    />
                )}

                <div className={styles.bannerOverlay}></div>
                <div className={styles.profileInfo}>
                    <img
                        src={getStorageUrl(producer.avatar) || '/default_avatar.png'}
                        alt={producer.artisticName}
                        className={styles.avatar}
                    />
                    <div className={styles.texts}>
                        <h1 className={styles.name}>{producer.artisticName}</h1>
                        <p className={styles.bio}>{producer.bio || 'Sem biografia.'}</p>

                        <div className={styles.meta}>
                            {producer.city && (
                                <span className={styles.location}>
                                    <FiMapPin /> {producer.city} - {producer.state}
                                </span>
                            )}
                            <div className={styles.socials}>
                                {producer.instagram && (
                                    <a href={producer.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                        <FiInstagram />
                                    </a>
                                )}
                                {producer.youtube && (
                                    <a href={producer.youtube} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                        <FiYoutube />
                                    </a>
                                )}
                            </div>
                            {user && user.id !== producer.id && (
                                <button
                                    className={styles.messageBtn}
                                    onClick={() => setIsChatOpen(true)}
                                    title="Enviar Mensagem"
                                >
                                    <FiMessageSquare /> Converse com o Produtor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>Produtos de {producer.artisticName}</h2>
                <div className={styles.grid}>
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={{ ...product, Producer: producer }}
                                onPlay={handlePlayPreview}
                                onAddToCart={addToCart}
                            />
                        ))
                    ) : (
                        <div className={styles.empty}>Este produtor ainda não tem produtos.</div>
                    )}
                </div>
            </div>

            {user && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipientId={producer.id}
                    recipientName={producer.artisticName}
                    recipientAvatar={getStorageUrl(producer.avatar)}
                />
            )}
        </div>
    );
};

export default ProducerStore;
