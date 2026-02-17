const { Review, Product, User, Order, OrderItem } = require('../database');

exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // 1. Validate Input
        if (!productId || !rating) {
            return res.status(400).json({ error: 'Produto e nota são obrigatórios.' });
        }

        // 2. Check if user purchased the product
        // We need to find an Order that is 'paid' and contains an OrderItem with this productId
        const hasPurchased = await Order.findOne({
            where: {
                buyerId: userId,
                status: 'paid'
            },
            include: [{
                model: OrderItem,
                where: { ProductId: productId }
            }]
        });

        if (!hasPurchased) {
            return res.status(403).json({ error: 'Você precisa comprar o produto para avaliar.' });
        }

        // 3. Check if already reviewed
        const existingReview = await Review.findOne({
            where: { userId, productId }
        });

        if (existingReview) {
            return res.status(400).json({ error: 'Você já avaliou este produto.' });
        }

        // 4. Create Review
        const review = await Review.create({
            userId,
            productId,
            rating,
            comment
        });

        // Notify Producer
        const product = await Product.findByPk(productId);
        if (product && product.producerId) {
            const NotificationService = require('../services/NotificationService');
            NotificationService.sendToUser(product.producerId, 'review', {
                title: 'Nova Avaliação!',
                message: `Seu produto "${product.title}" recebeu ${rating} estrelas.`,
                productId: product.id,
                rating
            });
        }

        res.status(201).json(review);

    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ error: 'Erro ao salvar avaliação.' });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.findAll({
            where: { productId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'avatar', 'artisticName']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Calculate Average
        let total = 0;
        reviews.forEach(r => total += r.rating);
        const average = reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;

        res.json({
            reviews,
            average,
            total: reviews.length
        });

    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
};

exports.getProducerReviews = async (req, res) => {
    try {
        const producerId = req.user.id; // Assuming the logged in user is the producer

        // Find all products by this producer
        const products = await Product.findAll({
            where: { producerId },
            attributes: ['id']
        });

        const productIds = products.map(p => p.id);

        if (productIds.length === 0) {
            return res.json({ reviews: [], average: 0, total: 0 });
        }

        const reviews = await Review.findAll({
            where: { productId: productIds },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: Product,
                    attributes: ['id', 'title', 'coverPath']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate Global Average
        let total = 0;
        reviews.forEach(r => total += r.rating);
        const average = reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;

        res.json({
            reviews,
            average,
            total: reviews.length
        });

    } catch (error) {
        console.error("Erro ao buscar avaliações do produtor:", error);
        res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userType = req.user.type; // 'admin', 'listener', 'artist'

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        // Allow deletion if Owner OR Admin
        if (review.userId !== userId && userType !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão para deletar.' });
        }

        await review.destroy();
        res.json({ message: 'Avaliação removida.' });

    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        res.status(500).json({ error: 'Erro ao deletar avaliação.' });
    }
};
