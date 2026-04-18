import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import styles from './ProducerFinance.module.css';
import { useToast } from '@/contexts/ToastContext';
import { FiDollarSign, FiClock, FiArrowUpRight, FiArrowDownLeft, FiRefreshCw } from 'react-icons/fi';

const ProducerFinance = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [pixKeyType, setPixKeyType] = useState('cpf');
    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletRes, transactionsRes] = await Promise.all([
                api.get('/finance/wallet'),
                api.get('/finance/transactions')
            ]);
            setWallet(walletRes.data);
            setTransactions(transactionsRes.data);
        } catch (error) {
            console.error("Erro ao carregar financeiro:", error);
            // addToast("Erro ao carregar dados financeiros.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();

        const amount = parseFloat(withdrawalAmount.replace('.', '').replace(',', '.'));
        if (!amount || amount <= 0) return addToast("Valor inválido.", "error");

        // Simple client-side validation using current state
        // Backend also validates
        const available = parseFloat(wallet?.balance || 0) + parseFloat(wallet?.pending_balance || 0);

        if (amount > available) return addToast("Saldo insuficiente.", "error");

        try {
            await api.post('/finance/withdrawals', {
                amount,
                pixKey,
                pixKeyType
            });
            addToast("Solicitação de saque enviada!", "success");
            setIsModalOpen(false);
            setWithdrawalAmount('');
            fetchData(); // Refresh balance
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.error || "Erro ao solicitar saque.", "error");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (val) => {
        return parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loading && !wallet) return <div className={styles.container}>Carregando financeiro...</div>;

    const availableBalance = parseFloat(wallet?.balance || 0);
    const pendingBalance = parseFloat(wallet?.pending_balance || 0);
    const totalBalance = availableBalance + pendingBalance;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Financeiro</h1>
                    <p className={styles.subtitle}>Gerencie seus ganhos e saques.</p>
                </div>
                <button onClick={fetchData} className={styles.cancelBtn} title="Atualizar">
                    <FiRefreshCw />
                </button>
            </div>

            {/* Cards */}
            <div className={styles.balanceGrid}>
                {/* Available / Total Card */}
                <div className={`${styles.card} ${styles.highlight}`}>
                    <div className={styles.cardLabel}><FiDollarSign /> Saldo Disponível</div>
                    <div className={styles.cardValue}>{formatCurrency(totalBalance)}</div>
                    <div className={styles.cardSub}>
                        {pendingBalance > 0 ? `(R$ ${pendingBalance.toFixed(2)} Pendente)` : 'Liberado para saque'}
                    </div>
                    <button
                        className={styles.withdrawBtn}
                        onClick={() => setIsModalOpen(true)}
                        disabled={totalBalance < 10} // Minimum withdrawal example
                    >
                        Solicitar Saque
                    </button>
                </div>

                {/* Earnings Card (Mock/Calculated) */}
                <div className={styles.card}>
                    <div className={styles.cardLabel}><FiArrowUpRight /> Total Ganho</div>
                    <div className={styles.cardValue}>
                        {formatCurrency(transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + parseFloat(t.amount), 0))}
                    </div>
                    <div className={styles.cardSub}>Em vendas diretas</div>
                </div>
            </div>

            {/* Transactions */}
            <h2 className={styles.sectionTitle}>Histórico</h2>
            <div className={styles.tableContainer}>
                {transactions.length === 0 ? (
                    <div className={styles.emptyState}>Nenhuma transação registrada.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td>{formatDate(t.createdAt)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {t.type === 'sale' ? <FiArrowUpRight color="var(--dynamic-accent)" /> : <FiArrowDownLeft color="#ff4d4d" />}
                                            {t.description}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${styles[t.status] || ''}`}>
                                            {t.status === 'completed' ? 'Concluído' : t.status === 'pending' ? 'Pendente' : t.status}
                                        </span>
                                    </td>
                                    <td className={`${styles.amount} ${t.type === 'withdrawal' ? styles.negative : styles.positive}`} style={{ textAlign: 'right' }}>
                                        {t.type === 'withdrawal' ? '-' : '+'} {formatCurrency(t.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Withdrawal Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Solicitar Saque</h2>
                        <form onSubmit={handleWithdrawal}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Valor (Saldo: {formatCurrency(totalBalance)})</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={withdrawalAmount}
                                    onChange={e => setWithdrawalAmount(e.target.value)}
                                    placeholder="Ex: 150,00"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Tipo de Chave Pix</label>
                                <select
                                    className={styles.select}
                                    value={pixKeyType}
                                    onChange={e => setPixKeyType(e.target.value)}
                                >
                                    <option value="cpf">CPF/CNPJ</option>
                                    <option value="email">E-mail</option>
                                    <option value="phone">Telefone</option>
                                    <option value="random">Chave Aleatória</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Chave Pix</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={pixKey}
                                    onChange={e => setPixKey(e.target.value)}
                                    placeholder="Digite sua chave pix"
                                    required
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.confirmBtn}>Confirmar Saque</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProducerFinance;
