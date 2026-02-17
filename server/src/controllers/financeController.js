const { Wallet, Transaction, Withdrawal, User } = require('../database');

exports.getWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        let wallet = await Wallet.findOne({ where: { UserId: userId } });

        if (!wallet) {
            wallet = await Wallet.create({ UserId: userId });
        }

        res.json(wallet);
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ error: 'Erro ao buscar carteira.' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch transactions where user is Payer OR Payee
        // For simplicity, let's just fetch credits (earnings) for producers for now, 
        // or we can use the Op.or to get both.
        const { Op } = require('sequelize');

        const transactions = await Transaction.findAll({
            where: {
                [Op.or]: [
                    { payerId: userId },
                    { payeeId: userId }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 50 // Pagination later
        });

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Erro ao buscar transações.' });
    }
};

exports.requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, pixKey, pixKeyType } = req.body;

        const wallet = await Wallet.findOne({ where: { UserId: userId } });

        if (!wallet) {
            return res.status(404).json({ error: 'Carteira não encontrada.' });
        }

        const currentBalance = parseFloat(wallet.balance) || 0;
        const currentPending = parseFloat(wallet.pending_balance) || 0;
        const totalAvailable = currentBalance + currentPending;

        // Precision handling to avoid floating point errors (e.g. 30.0000000004 > 30)
        // Using a small epsilon or rounding to 2 decimal places for comparison
        if (parseFloat(amount) > parseFloat(totalAvailable.toFixed(2))) {
            return res.status(400).json({
                error: 'Saldo insuficiente.',
                details: { amount, totalAvailable, currentBalance, currentPending }
            });
        }

        // Create Withdrawal Request
        const withdrawal = await Withdrawal.create({
            UserId: userId,
            amount,
            pixKey,
            pixKeyType,
            status: 'pending'
        });

        // Deduct logic: Try pending first, then balance
        let remainingToDeduct = parseFloat(amount);

        if (currentPending >= remainingToDeduct) {
            wallet.pending_balance = currentPending - remainingToDeduct;
            remainingToDeduct = 0;
        } else {
            wallet.pending_balance = 0;
            remainingToDeduct -= currentPending;
        }

        if (remainingToDeduct > 0) {
            wallet.balance = currentBalance - remainingToDeduct;
        }

        await wallet.save();

        // Log Transaction (Debit)
        await Transaction.create({
            type: 'withdrawal',
            amount: amount,
            status: 'pending',
            payerId: userId, // User is paying themselves out? Or System pays User? 
            // Better: Payer = User (Debited), Payee = System (Or null internal)
            // Let's stick to: Type tells the story.
            description: `Solicitação de Saque #${withdrawal.id}`,
            paymentMethod: 'pix'
        });

        const NotificationService = require('../services/NotificationService');
        await NotificationService.notifyFinance(
            'Novo Pedido de Saque',
            `O usuário #${userId} solicitou um saque de R$ ${amount}.`,
            `/admin/credits`
        );

        res.status(201).json(withdrawal);
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ error: 'Erro ao solicitar saque.' });
    }
};

exports.getWithdrawals = async (req, res) => {
    try {
        const userId = req.user.id;
        const withdrawals = await Withdrawal.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(withdrawals);
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ error: 'Erro ao buscar saques.' });
    }
};
