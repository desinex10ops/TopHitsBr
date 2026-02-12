const { Wallet, CreditTransaction, CreditPackage, User } = require('../database');

// Helper: Ensure wallet exists
const getWallet = async (userId) => {
    let wallet = await Wallet.findOne({ where: { UserId: userId } });
    if (!wallet) {
        wallet = await Wallet.create({ UserId: userId, balance: 0 });
    }
    return wallet;
};

exports.getBalance = async (req, res) => {
    try {
        const wallet = await getWallet(req.user.id);
        res.json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar saldo.' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const wallet = await getWallet(req.user.id);
        const transactions = await CreditTransaction.findAll({
            where: { WalletId: wallet.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar transações.' });
    }
};

exports.buyPackage = async (req, res) => {
    try {
        const { packageId } = req.body;
        const pkg = await CreditPackage.findByPk(packageId);

        if (!pkg) {
            return res.status(404).json({ error: 'Pacote não encontrado.' });
        }

        const wallet = await getWallet(req.user.id);

        // Mock Payment Success
        // In real app, verify payment gateway callback here.

        // Atomic Transaction (Simulated with Sequelize transaction if needed, but keeping simple for SQLite)
        const newCredits = wallet.credits + pkg.credits;
        await wallet.update({ credits: newCredits });

        await CreditTransaction.create({
            WalletId: wallet.id,
            amount: pkg.credits,
            type: 'purchase',
            description: `Compra: ${pkg.name}`,
            referenceId: `PKG-${pkg.id}-${Date.now()}`
        });

        res.json({ message: 'Compra realizada com sucesso!', newCredits });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar compra.' });
    }
};
