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
