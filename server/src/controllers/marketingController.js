const { Coupon, Product } = require('../database');

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, productId, validUntil, usageLimit } = req.body;
        const producerId = req.user.id;

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercentage,
            productId: productId || null,
            validUntil,
            usageLimit: usageLimit || -1,
            producerId
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error("Erro ao criar cupom:", error);
        res.status(500).json({ error: 'Erro ao criar cupom.' });
    }
};

exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            where: { producerId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar cupons.' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findOne({ where: { id, producerId: req.user.id } });
        if (!coupon) return res.status(404).json({ error: 'Cupom não encontrado.' });

        await coupon.destroy();
        res.json({ message: 'Cupom excluído.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir cupom.' });
    }
};

// Validar Cupom (Usado no Checkout/Carrinho)
exports.validateCoupon = async (req, res) => {
    try {
        const { code, productId, totalValue } = req.body;
        const { Op } = require('sequelize');

        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                active: true,
                [Op.or]: [
                    { validUntil: null },
                    { validUntil: { [Op.gt]: new Date() } }
                ]
            }
        });

        if (!coupon) return res.status(404).json({ error: 'Cupom inválido ou expirado.' });

        if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'Limite de uso do cupom atingido.' });
        }

        // Se for cupom de produtor, verificar se aplica ao produto
        if (coupon.producerId) {
            if (productId) {
                const product = await Product.findByPk(productId);
                if (!product || product.producerId !== coupon.producerId) {
                    return res.status(400).json({ error: 'Este cupom não se aplica a este produtor.' });
                }
            } else {
                // Se for carrinho misto, a lógica frontal deve somar apenas os produtos do produtor
                // Aqui podemos retornar o producerId para o front tratar
            }
        }

        // Se tiver productId específico
        if (coupon.productId && coupon.productId !== parseInt(productId)) {
            return res.status(400).json({ error: 'Este cupom não se aplica a este produto específico.' });
        }

        res.json({
            valid: true,
            discountPercentage: coupon.discountPercentage,
            producerId: coupon.producerId,
            productId: coupon.productId
        });

    } catch (error) {
        console.error("Erro ao validar cupom:", error);
        res.status(500).json({ error: 'Erro ao validar cupom.' });
    }
};

// --- Admin Section (Global Coupons) ---

exports.adminCreateCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, validUntil, usageLimit } = req.body;
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercentage,
            validUntil,
            usageLimit: usageLimit || -1,
            producerId: null // Global
        });
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar cupom global.' });
    }
};

exports.adminGetCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            where: { producerId: null },
            order: [['createdAt', 'DESC']]
        });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cupons globais.' });
    }
};

exports.adminDeleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findOne({ where: { id, producerId: null } });
        if (!coupon) return res.status(404).json({ error: 'Cupom global não encontrado.' });
        await coupon.destroy();
        res.json({ message: 'Cupom excluído.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir cupom.' });
    }
};
