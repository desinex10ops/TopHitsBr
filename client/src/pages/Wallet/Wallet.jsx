import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '@/contexts/ToastContext';
import styles from './Wallet.module.css';
import { FiCreditCard, FiClock, FiActivity, FiTrendingUp } from 'react-icons/fi';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchWalletData();
        fetchPackages();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [balanceRes, transactionsRes] = await Promise.all([
                api.get('/credits/wallet'),
                api.get('/credits/wallet/transactions')
            ]);
            setBalance(balanceRes.data.balance);
            setTransactions(transactionsRes.data);
        } catch (error) {
            console.error("Erro ao carregar carteira:", error);
            // addToast("Erro ao carregar dados da carteira.", "error"); // Optional, maybe silent fail is better or global error handler
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await api.get('/credits/admin/packages');
            // If admin hasn't created packages yet, use defaults or empty
            if (response.data.length === 0) {
                setPackages([
                    { id: 1, name: 'Pacote Start', credits: 10, price: 9.90, description: 'Para começar.' },
                    { id: 2, name: 'Pacote Pro', credits: 35, price: 29.90, description: 'Melhor custo-benefício.' },
                    { id: 3, name: 'Pacote Turbo', credits: 70, price: 49.90, description: 'Para quem quer voar alto.' }
                ]);
            } else {
                setPackages(response.data);
            }
        } catch (error) {
            console.error(error);
            // Fallback default packages if API fails or empty
            setPackages([
                { id: 1, name: 'Pacote Start', credits: 10, price: 9.90, description: 'Para começar.' },
                { id: 2, name: 'Pacote Pro', credits: 35, price: 29.90, description: 'Melhor custo-benefício.' },
                { id: 3, name: 'Pacote Turbo', credits: 70, price: 49.90, description: 'Para quem quer voar alto.' }
            ]);
        }
    };

    const handleBuy = async (pkg) => {
        try {
            // In a real app, this would open Stripe/PayPal
            // Here we verify with a mock confirmation
            if (!window.confirm(`Confirmar compra de ${pkg.name} por R$ ${pkg.price.toFixed(2)}?`)) return;

            await api.post('/credits/wallet/buy', { packageId: pkg.id });
            addToast(`Compra realizada! +${pkg.credits} créditos.`, "success");
            fetchWalletData(); // Refresh balance
        } catch (error) {
            console.error(error);
            addToast("Erro ao processar compra.", "error");
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    if (loading) return <div className={styles.loading}>Carregando carteira...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Minha Carteira</h1>
                <p className={styles.subtitle}>Gerencie seus créditos e impulsione sua carreira.</p>
            </div>

            {/* Balance Card */}
            <div className={styles.balanceCard}>
                <div className={styles.balanceInfo}>
                    <span className={styles.balanceLabel}>Saldo Atual</span>
                    <div className={styles.balanceValue}>
                        <FiCreditCard className={styles.icon} />
                        <span>{balance}</span>
                        <span className={styles.currency}>créditos</span>
                    </div>
                </div>
                <button className={styles.historyBtn} onClick={() => document.getElementById('history').scrollIntoView({ behavior: 'smooth' })}>
                    <FiClock /> Ver Histórico
                </button>
            </div>

            {/* Packages Section */}
            <h2 className={styles.sectionTitle}>Adicionar Créditos</h2>
            <div className={styles.packagesGrid}>
                {packages.map(pkg => (
                    <div key={pkg.id} className={`${styles.packageCard} ${pkg.name.includes('Turbo') ? styles.turbo : ''}`}>
                        <div className={styles.packageHeader}>
                            <h3 className={styles.packageName}>{pkg.name}</h3>
                            <span className={styles.packageCredits}>{pkg.credits} CRÉDITOS</span>
                        </div>
                        <p className={styles.packageDesc}>{pkg.description}</p>
                        <div className={styles.packagePrice}>
                            R$ {pkg.price.toFixed(2).replace('.', ',')}
                        </div>
                        <button className={styles.buyBtn} onClick={() => handleBuy(pkg)}>
                            COMPRAR AGORA
                        </button>
                    </div>
                ))}
            </div>

            {/* Transactions History */}
            <h2 id="history" className={styles.sectionTitle}>Histórico de Transações</h2>
            <div className={styles.historyContainer}>
                {transactions.length === 0 ? (
                    <p className={styles.emptyHistory}>Nenhuma transação encontrada.</p>
                ) : (
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th className={styles.textRight}>Gasto/Ganho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td>{formatDate(t.createdAt)}</td>
                                    <td>{t.description}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[t.type]}`}>
                                            {t.type === 'purchase' ? 'Compra' : t.type === 'boost' ? 'Impulsionamento' : t.type}
                                        </span>
                                    </td>
                                    <td className={`${styles.textRight} ${t.amount > 0 ? styles.positive : styles.negative}`}>
                                        {t.amount > 0 ? '+' : ''}{t.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Wallet;
