import React, { useState } from 'react';
import styles from './BoostBlock.module.css';
import { FiTrendingUp, FiDownload, FiStar, FiMusic, FiUsers, FiX, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

const BoostBlock = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState('album'); // 'album' | 'music'
    const { addToast } = useToast();

    const handleBoostClick = () => {
        setShowModal(true);
    };

    const handleConfirm = () => {
        setShowModal(false);
        addToast('Redirecionando para o pagamento...', 'success');
        // Logic to redirect or integration would go here
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.headerBadge}>
                        <FiStar /> Destaque Garantido
                    </div>
                    <h2 className={styles.title}>🚀 Impulsione seu Álbum</h2>
                    <p className={styles.subtitle}>
                        Ganhe mais visibilidade, mais downloads e alcance milhares de ouvintes com nosso plano de destaque exclusivo.
                    </p>

                    <div className={styles.benefitsList}>
                        <div className={styles.benefitItem}><FiTrendingUp className={styles.benefitIcon} /> Primeiros resultados da busca</div>
                        <div className={styles.benefitItem}><FiDownload className={styles.benefitIcon} /> Aumento real de downloads</div>
                        <div className={styles.benefitItem}><FiStar className={styles.benefitIcon} /> Destaque na página inicial</div>
                        <div className={styles.benefitItem}><FiUsers className={styles.benefitIcon} /> Exposição para DJs e fãs</div>
                    </div>
                </div>

                <div className={styles.priceSection}>
                    <span className={styles.priceLabel}>Apenas</span>
                    <div className={styles.priceValue}>
                        <span>R$</span> 9,90
                    </div>
                    <div className={styles.pricePeriod}>Destaque por 7 dias</div>
                    <button className={styles.ctaButton} onClick={handleBoostClick}>
                        🚀 IMPULSIONAR AGORA
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowModal(false)}><FiX /></button>

                        <h3 className={styles.modalTitle}>Confirmar Impulso</h3>

                        <div className={styles.selectionArea}>
                            <div
                                className={`${styles.selectOption} ${selectedType === 'album' ? styles.active : ''}`}
                                onClick={() => setSelectedType('album')}
                            >
                                <FiStar size={24} color={selectedType === 'album' ? 'var(--dynamic-accent)' : '#666'} />
                                <span>Álbum Completo</span>
                            </div>
                            <div
                                className={`${styles.selectOption} ${selectedType === 'music' ? styles.active : ''}`}
                                onClick={() => setSelectedType('music')}
                            >
                                <FiMusic size={24} color={selectedType === 'music' ? 'var(--dynamic-accent)' : '#666'} />
                                <span>Música Única</span>
                            </div>
                        </div>

                        <div className={styles.previewCard}>
                            <div className={styles.previewCover}>
                                {/* Placeholder for cover art */}
                                <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    🎵
                                </div>
                            </div>
                            <div className={styles.previewDetails}>
                                <h4>{selectedType === 'album' ? 'Seu Último Álbum' : 'Sua Última Música'}</h4>
                                <p>R$ 9,90 • 7 Dias de Destaque</p>
                            </div>
                        </div>

                        <button className={styles.confirmBtn} onClick={handleConfirm}>
                            Confirmar Pagamento
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BoostBlock;
