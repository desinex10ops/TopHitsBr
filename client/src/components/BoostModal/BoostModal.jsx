import React, { useState, useEffect } from 'react';
import styles from './BoostModal.module.css';
import api from '../../services/api';
import { FiTrendingUp, FiCheckCircle, FiX, FiActivity, FiStar, FiZap, FiTarget } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';

// Tier Definitions for UI
const TIERS = [
    {
        id: 'basic',
        icon: <FiActivity />,
        title: 'Básico',
        color: '#888',
        features: ['Destaque em Gêneros', 'Entrega mín: 1k impr.', 'Score x1.0']
    },
    {
        id: 'advanced',
        icon: <FiZap />,
        title: 'Avançado',
        color: '#00ccff',
        features: ['Home + Busca', 'Entrega mín: 2.5k impr.', 'Score x1.2']
    },
    {
        id: 'premium',
        icon: <FiStar />,
        title: 'Premium',
        color: '#ffaa00',
        features: ['Banner Principal', 'Fila Inteligente', 'Entrega mín: 10k impr.', 'Score x1.5']
    }
];

const BoostModal = ({ item, type, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState('advanced');
    const [duration, setDuration] = useState(7);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [calculatedCost, setCalculatedCost] = useState(0);
    const [estimatedReach, setEstimatedReach] = useState(0);

    const { addToast } = useToast();

    // 1. Fetch Wallet & Initial Settings
    useEffect(() => {
        api.get('/credits/wallet')
            .then(res => setWallet(res.data))
            .catch(() => addToast("Erro ao carregar carteira.", "error"))
            .finally(() => setLoading(false));
    }, [addToast]);

    // 2. Recalculate Cost when Tier/Duration changes
    useEffect(() => {
        const fetchCost = async () => {
            try {
                const res = await api.get('/credits/boost/calculate-cost', {
                    params: { type, durationDays: duration, tier: selectedTier }
                });
                setCalculatedCost(res.data.cost);

                // Estimate Reach roughly based on tier targets * duration factor
                const baseReach = res.data.features.impressionTarget;
                const factor = duration / 7;
                setEstimatedReach(Math.floor(baseReach * factor));

            } catch (error) {
                console.error(error);
            }
        };
        fetchCost();
    }, [type, selectedTier, duration]);

    const handleConfirm = async () => {
        if (!wallet || wallet.balance < calculatedCost) {
            addToast("Saldo insuficiente!", "error");
            return;
        }

        setProcessing(true);
        try {
            const response = await api.post('/credits/boost', {
                type,
                targetId: item.id,
                durationDays: duration,
                tier: selectedTier
            });

            addToast("🚀 Impulsionamento iniciado com sucesso!", "success");
            if (onSuccess) onSuccess(response.data);
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || "Erro ao processar.";
            addToast(msg, "error");
        } finally {
            setProcessing(false);
        }
    };

    if (!item) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}><FiX /></button>

                <div className={styles.header}>
                    <FiTrendingUp className={styles.rocketIcon} />
                    <h2>Impulsionar {type === 'album' ? 'Álbum' : 'Música'}</h2>
                    <p className={styles.subtitle}>{item.title || item.name} - {item.artist}</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
                ) : (
                    <>
                        {/* TIER SELECTION */}
                        <div className={styles.tierGrid}>
                            {TIERS.map(tier => (
                                <div
                                    key={tier.id}
                                    className={`${styles.tierCard} ${styles[tier.id]} ${selectedTier === tier.id ? styles.active : ''}`}
                                    onClick={() => setSelectedTier(tier.id)}
                                >
                                    <div className={styles.menuIcon}>{tier.icon}</div>
                                    <h3 className={styles.tierTitle}>{tier.title}</h3>

                                    <ul className={styles.featuresList}>
                                        {tier.features.map((feat, i) => (
                                            <li key={i}><FiCheckCircle /> {feat}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* REACH METER (Visual Gauge) */}
                        <div className={styles.reachSection}>
                            <div className={styles.reachHeader}>
                                <span>Alcance Estimado</span>
                                <span className={styles.reachValue}>~{estimatedReach.toLocaleString()} visualizações</span>
                            </div>
                            <div className={styles.reachMetterContainer}>
                                <div
                                    className={`${styles.reachFill} ${styles[selectedTier]}`}
                                    style={{ width: `${Math.min((estimatedReach / 20000) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className={styles.reachSubtitle}>O alcance real depende do engajamento orgânico do seu conteúdo.</p>
                        </div>

                        {/* DURATION SELECTION */}
                        <div className={styles.durationSection}>
                            <div className={styles.sectionTitle}>
                                <span>Duração da Campanha</span>
                                <span><FiTarget /> {duration} dias selecionados</span>
                            </div>
                            <div className={styles.daysGrid}>
                                {[3, 7, 15, 30].map(d => (
                                    <button
                                        key={d}
                                        className={`${styles.dayOption} ${duration === d ? styles.active : ''}`}
                                        onClick={() => setDuration(d)}
                                    >
                                        {d} dias
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className={styles.footer}>
                            <div className={styles.totalSection}>
                                <span className={styles.totalLabel}>Investimento Total</span>
                                <span className={styles.totalCost}>{calculatedCost} Créditos</span>
                                <span className={`${styles.balanceInfo} ${wallet.balance < calculatedCost ? styles.error : ''}`}>
                                    Saldo: {wallet.balance} Cr
                                </span>
                            </div>

                            {wallet.balance >= calculatedCost ? (
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleConfirm}
                                    disabled={processing}
                                >
                                    {processing ? 'Confirmando...' : 'CONFIRMAR AGORA'}
                                </button>
                            ) : (
                                <button
                                    className={styles.menuIcon} /* Using generic class, ideally should be rechargeBtn */
                                    style={{ background: '#444', fontSize: '1rem', border: 'none', padding: '1rem 2rem', borderRadius: '50px', cursor: 'pointer' }}
                                    onClick={() => window.location.href = '/wallet'}
                                >
                                    Recarregar (+ Créditos)
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BoostModal;
