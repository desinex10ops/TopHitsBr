import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import styles from './BecomeSeller.module.css';
import { FiDollarSign, FiBox, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const BecomeSeller = () => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [artisticName, setArtisticName] = useState(user?.artisticName || '');
    const [loading, setLoading] = useState(false);

    const handleBecomeSeller = async () => {
        if (!artisticName.trim()) {
            addToast('Por favor, defina um Nome Artístico.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/become-seller', { artisticName });
            updateUser({ ...user, isSeller: true, artisticName });
            addToast('Parabéns! Você agora é um vendedor oficial.', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao processar solicitação.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (user?.isSeller) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <FiCheckCircle size={64} color="#1DB954" />
                    <h2>Você já é um Vendedor!</h2>
                    <p>Agora você tem acesso total ao Catálogo, Vendas e Financeiro no seu menu lateral.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <h1>Transforme sua música em um <span className={styles.highlight}>Negócio</span></h1>
                <p>Comece a vender seus Beats, Samples, Packs de Vocais e Serviços diretamente para ouvintes e outros produtores.</p>
            </div>

            <div className={styles.features}>
                <div className={styles.featureCard}>
                    <FiBox className={styles.featureIcon} />
                    <h3>Venda Produtos</h3>
                    <p>Crie um catálogo digital e venda arquivos de alta qualidade com entrega automática.</p>
                </div>
                <div className={styles.featureCard}>
                    <FiDollarSign className={styles.featureIcon} />
                    <h3>Gestão Financeira</h3>
                    <p>Acompanhe suas vendas em tempo real e solicite saques diretamente para sua conta.</p>
                </div>
                <div className={styles.featureCard}>
                    <FiTrendingUp className={styles.featureIcon} />
                    <h3>Marketing Direto</h3>
                    <p>Use nossas ferramentas para impulsionar seus produtos e alcançar novos clientes.</p>
                </div>
            </div>

            <div className={styles.onboardingBox}>
                <h2>Pronto para começar?</h2>
                <div className={styles.inputGroup}>
                    <label>Seu Nome Artístico / Nome da Loja</label>
                    <input
                        type="text"
                        value={artisticName}
                        onChange={(e) => setArtisticName(e.target.value)}
                        placeholder="Ex: DJ Batida, Records Store..."
                    />
                </div>
                <p>Ao se tornar um vendedor, você concorda com nossos termos de marketplace e comissões.</p>
                <button
                    className={styles.becomeBtn}
                    onClick={handleBecomeSeller}
                    disabled={loading}
                >
                    {loading ? 'Processando...' : 'Ativar Modo Vendedor 🚀'}
                </button>
            </div>
        </div>
    );
};

export default BecomeSeller;
