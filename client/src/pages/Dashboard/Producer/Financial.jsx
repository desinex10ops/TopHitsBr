import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './Financial.module.css';
import { FiDollarSign, FiClock, FiArrowUpRight, FiArrowDownLeft, FiDownload } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';

const Financial = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [pixKey, setPixKey] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, transRes] = await Promise.all([
                api.get('/finance/wallet'),
                api.get('/finance/transactions')
            ]);
            setWallet(walletRes.data);
            setTransactions(transRes.data);
        } catch (error) {
            console.error(error);
            addToast('Erro ao carregar dados financeiros.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        if (!withdrawalAmount || !pixKey) return;

        try {
            await api.post('/finance/withdrawals', {
                amount: withdrawalAmount,
                pixKey,
                pixKeyType: 'CPF/Email/Random' // Simplified for now
            });
            addToast('Saque solicitado com sucesso!', 'success');
            setWithdrawalAmount('');
            fetchData(); // Refresh balance
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.error || 'Erro ao solicitar saque.', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Carregando financeiro...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Financeiro</h1>

            {/* Wallet Cards */}
            <div className={styles.cardsGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Saldo Disponível</span>
                        <FiDollarSign className={styles.iconGreen} />
                    </div>
                    <div className={styles.amount}>
                        R$ {parseFloat(wallet?.balance || 0).toFixed(2).replace('.', ',')}
                    </div>
                    <div className={styles.subtext}>Pronto para saque</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Saldo Pendente</span>
                        <FiClock className={styles.iconYellow} />
                    </div>
                    <div className={styles.amount}>
                        R$ {parseFloat(wallet?.pending_balance || 0).toFixed(2).replace('.', ',')}
                    </div>
                    <div className={styles.subtext}>Liberado após período de segurança</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>Total Ganho</span>
                        <FiArrowUpRight className={styles.iconBlue} />
                    </div>
                    {/* We could calculate total lifetime earnings from transactions later */}
                    <div className={styles.amount}>
                        R$ {((parseFloat(wallet?.balance || 0) + parseFloat(wallet?.pending_balance || 0))).toFixed(2).replace('.', ',')}
                    </div>
                    <div className={styles.subtext}>Saldo total atual</div>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Withdrawal Form */}
                <div className={styles.withdrawalSection}>
                    <h2>Solicitar Saque</h2>
                    <form onSubmit={handleWithdrawal} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Valor (R$)</label>
                            <input
                                type="number"
                                placeholder="0,00"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                min="10"
                                step="0.01"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Chave PIX</label>
                            <input
                                type="text"
                                placeholder="CPF, Email, Telefone ou Aleatória"
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={styles.withdrawBtn} disabled={!wallet || wallet.balance <= 0}>
                            Solicitar Transferência
                        </button>
                    </form>
                    <p className={styles.note}>
                        * Saques são processados em até 24 horas úteis via PIX.<br />
                        * Valor mínimo: R$ 10,00.
                    </p>
                </div>

                {/* Transactions History */}
                <div className={styles.historySection}>
                    <h2>Histórico</h2>
                    <div className={styles.historyList}>
                        {transactions.length === 0 ? (
                            <p className={styles.empty}>Nenhuma transação encontrada.</p>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} className={styles.transactionItem}>
                                    <div className={styles.transIcon}>
                                        {t.type === 'sale' ? <FiArrowDownLeft color="#1db954" /> :
                                            t.type === 'withdrawal' ? <FiArrowUpRight color="#ff5555" /> :
                                                <FiDollarSign />}
                                    </div>
                                    <div className={styles.transInfo}>
                                        <strong>{t.description || t.type}</strong>
                                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`${styles.transAmount} ${t.type === 'withdrawal' ? styles.red : styles.green}`}>
                                        {t.type === 'withdrawal' ? '-' : '+'} R$ {parseFloat(t.amount).toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Financial;
