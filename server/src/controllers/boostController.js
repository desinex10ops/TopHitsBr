const { Boost, Wallet, CreditTransaction, sequelize } = require('../database');

// Preços (Em moedas) - Poderia estar no Banco de Dados (SystemSettings)
const PRICES = {
    basic: 100,
    advanced: 250,
    premium: 500
};

exports.calculateBoostCost = async (req, res) => {
    const { tier, durationDays } = req.query;
    if (!tier || !durationDays) return res.status(400).json({ error: 'Missing parameters' });

    const pricePerDay = PRICES[tier] || PRICES.basic;
    const totalCost = pricePerDay * durationDays;

    res.json({ cost: totalCost });
};

exports.createBoost = async (req, res) => {
    const { type, targetId, tier, durationDays, targetName } = req.body;
    const userId = req.user.id;

    if (!type || !targetId || !durationDays) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const pricePerDay = PRICES[tier] || PRICES.basic;
    const cost = pricePerDay * durationDays;

    const t = await sequelize.transaction();

    try {
        // 1. Verificar Saldo de Créditos
        const wallet = await Wallet.findOne({ where: { UserId: userId }, transaction: t });
        const currentBalance = wallet ? (parseFloat(wallet.balance) || 0) : 0;

        if (!wallet || currentBalance < cost) {
            await t.rollback();
            return res.status(402).json({ error: 'Créditos insuficientes. Recarregue sua carteira.' });
        }

        // 2. Debitar da Carteira
        wallet.balance = currentBalance - cost;
        await wallet.save({ transaction: t });

        // 3. Registrar Transação
        await CreditTransaction.create({
            WalletId: wallet.id,
            type: 'boost',
            amount: cost,
            description: `Boost ${tier} para ${type} #${targetId} por ${durationDays} dias`
        }, { transaction: t });

        // 4. Criar Boost
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + parseInt(durationDays));

        const newBoost = await Boost.create({
            UserId: userId,
            type,
            targetId,
            targetName: targetName || 'Unknown Hook',
            tier: tier || 'basic',
            cost,
            durationDays,
            startDate,
            endDate,
            status: 'active',
            baseScore: tier === 'premium' ? 100 : (tier === 'advanced' ? 50 : 10),
            currentScore: tier === 'premium' ? 100 : (tier === 'advanced' ? 50 : 10),
            smartBoostActive: true
        }, { transaction: t });

        await t.commit();
        res.status(201).json(newBoost);

    } catch (error) {
        await t.rollback();
        console.error("Erro ao criar boost:", error);
        res.status(500).json({ error: 'Erro ao processar impulsionamento' });
    }
};

exports.getMyBoosts = async (req, res) => {
    try {
        const boosts = await Boost.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(boosts);
    } catch (error) {
        console.error("Erro ao buscar boosts:", error);
        res.status(500).json({ error: 'Erro interno' });
    }
};

exports.getActiveBoosts = async (req, res) => {
    // Endpoint público ou interno para o motor de recomendação
    try {
        const boosts = await Boost.findAll({
            where: { status: 'active' },
            order: [['currentScore', 'DESC']]
        });

        // Populate items manually (Polymorphic-ish)
        const populatedBoosts = await Promise.all(boosts.map(async (boost) => {
            let item = null;
            if (boost.type === 'album') {
                const { Album, User } = require('../database');
                item = await Album.findByPk(boost.targetId, {
                    include: [{ model: User, attributes: ['name', 'artisticName'] }]
                });
                if (item) {
                    item = item.toJSON();
                    item.artist = item.User ? (item.User.artisticName || item.User.name) : 'Desconhecido';
                    item.coverpath = item.cover; // Normalize for frontend
                    item.videopath = item.video; // Normalize for frontend
                }
            } else if (boost.type === 'track') {
                const { Track, User, Album } = require('../database');
                item = await Track.findByPk(boost.targetId, {
                    include: [
                        { model: User, attributes: ['name', 'artisticName'] },
                        { model: Album, attributes: ['title', 'cover', 'video'] }
                    ]
                });
                if (item) {
                    item = item.toJSON();
                    item.artist = item.artist || (item.User ? (item.User.artisticName || item.User.name) : 'Desconhecido');
                    // Use Album video if available
                    if (item.Album && item.Album.video) {
                        item.videopath = item.Album.video;
                    }
                }
            }

            if (!item) return null; // Filter out invalid boosts

            return {
                ...boost.toJSON(),
                item
            };
        }));

        const validBoosts = populatedBoosts.filter(b => b);
        res.json(validBoosts);
    } catch (error) {
        console.error("Erro ao buscar boosts ativos:", error);
        res.status(500).json({ error: 'Erro interno' });
    }
};

exports.trackInteraction = async (req, res) => {
    const { boostId, type } = req.body; // type: 'click' (play) or 'impression' (view)

    if (!boostId) {
        return res.status(400).json({ error: 'Boost ID required' });
    }

    try {
        const boost = await Boost.findByPk(boostId);
        if (!boost) {
            return res.status(404).json({ error: 'Boost not found' });
        }

        if (type === 'click') {
            // Atomic increment
            await boost.increment('clicks');
            if (boost.smartBoostActive) {
                // Should also update score ideally
            }
        } else if (type === 'impression') {
            await boost.increment('impressions');
        } else if (type === 'play') { // synonymous with click from featured artist context
            await boost.increment('plays');
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error tracking boost interaction:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
