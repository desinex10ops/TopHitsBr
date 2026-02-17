const { Withdrawal, User, Transaction, Wallet, Order, sequelize } = require('../database');
const { Op } = require('sequelize');

exports.listAllWithdrawals = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const { count, rows } = await Withdrawal.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'artisticName']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            withdrawals: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Erro ao listar saques (admin):', error);
        res.status(500).json({ error: 'Erro ao listar saques.' });
    }
};

const emailService = require('../services/emailService');

exports.manageWithdrawal = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, remarks } = req.body; // 'paid' or 'rejected'

        const withdrawal = await Withdrawal.findByPk(id, { include: [User] });
        if (!withdrawal) {
            return res.status(404).json({ error: 'Pedido de saque não encontrado.' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ error: 'Este saque já foi processado.' });
        }

        if (status === 'paid') {
            await withdrawal.update({ status: 'paid', remarks }, { transaction: t });

            // Log final transaction
            await Transaction.create({
                type: 'withdrawal',
                amount: withdrawal.amount,
                status: 'completed',
                payeeId: withdrawal.UserId,
                description: `Saque #${id} concluído.`,
                paymentMethod: 'pix'
            }, { transaction: t });

        } else if (status === 'rejected') {
            await withdrawal.update({ status: 'rejected', remarks }, { transaction: t });

            // Refund user wallet
            const wallet = await Wallet.findOne({ where: { UserId: withdrawal.UserId } });
            if (wallet) {
                wallet.balance = parseFloat(wallet.balance) + parseFloat(withdrawal.amount);
                await wallet.save({ transaction: t });
            }

            // Log reversal
            await Transaction.create({
                type: 'refund',
                amount: withdrawal.amount,
                status: 'completed',
                payeeId: withdrawal.UserId,
                description: `Estorno de saque #${id}: ${remarks || 'Rejeitado pelo administrador'}`,
            }, { transaction: t });
        }

        await t.commit();

        // Notify User via Email (Non-blocking)
        try {
            if (withdrawal.User && withdrawal.User.email) {
                await emailService.notifyWithdrawalUpdate(withdrawal.User, withdrawal);
            }
        } catch (emailError) {
            console.error('Falha ao enviar email de saque:', emailError);
        }

        res.json({ message: `Saque ${status === 'paid' ? 'aprovado' : 'rejeitado'} com sucesso.` });
    } catch (error) {
        await t.rollback();
        console.error('Erro ao gerenciar saque:', error);
        res.status(500).json({ error: 'Erro ao processar saque.' });
    }
};

exports.getFinanceSummary = async (req, res) => {
    try {
        // Global stats
        const totalSales = await Order.sum('total') || 0;
        const pendingWithdrawals = await Withdrawal.sum('amount', { where: { status: 'pending' } }) || 0;
        const totalPaidWithdrawals = await Withdrawal.sum('amount', { where: { status: 'paid' } }) || 0;

        // Recent Transactions (Global)
        const recentSales = await Transaction.findAll({
            where: { type: 'sale' },
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'Payer', attributes: ['name'] },
                { model: User, as: 'Payee', attributes: ['name'] }
            ]
        });

        res.json({
            summary: {
                totalSales,
                pendingWithdrawals,
                totalPaidWithdrawals,
                platformEarnings: totalSales * 0.1 // Assuming 10% commission if not stored
            },
            recentSales
        });
    } catch (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo financeiro.' });
    }
};
