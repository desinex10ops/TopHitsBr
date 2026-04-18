const { Product, User, Order, OrderItem, Withdrawal, sequelize } = require('../database');
const path = require('path');
const fs = require('fs');

exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, type, bpm, tonality, tags, includedContent, category, stock } = req.body;
        const producerId = req.user.id;

        // Files from Multer
        const files = req.files;
        let previewPath = null;
        let fileData = null;
        let coverPath = null;

        if (files['preview']) previewPath = path.relative(path.join(__dirname, '../../storage'), files['preview'][0].path);
        if (files['file']) fileData = path.relative(path.join(__dirname, '../../storage'), files['file'][0].path);
        if (files['cover']) coverPath = path.relative(path.join(__dirname, '../../storage'), files['cover'][0].path);

        if (!fileData || !title || !price) {
            return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
        }

        const product = await Product.create({
            title,
            description,
            price,
            type,
            bpm,
            tonality,
            tags: tags ? JSON.parse(tags) : [],
            includedContent,
            category,
            stock: stock || -1,
            previewPath,
            fileData,
            coverPath,
            producerId,
            status: 'active'
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, type, bpm, tonality, tags, includedContent, category, stock, status } = req.body;

        const product = await Product.findOne({ where: { id, producerId: req.user.id } });
        if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

        // Handle File Updates
        const files = req.files || {};
        if (files['preview']) product.previewPath = path.relative(path.join(__dirname, '../../storage'), files['preview'][0].path);
        if (files['file']) product.fileData = path.relative(path.join(__dirname, '../../storage'), files['file'][0].path);
        if (files['cover']) product.coverPath = path.relative(path.join(__dirname, '../../storage'), files['cover'][0].path);

        if (title) product.title = title;
        if (description) product.description = description;
        if (price) product.price = price;
        if (type) product.type = type;
        if (bpm) product.bpm = bpm;
        if (tonality) product.tonality = tonality;
        if (tags) product.tags = JSON.parse(tags);
        if (includedContent) product.includedContent = includedContent;
        if (category) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (status) product.status = status;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { type, search, sort } = req.query;
        const where = { status: 'active' };

        if (type) where.type = type;
        if (search) {
            const { Op } = require('sequelize');
            where.title = { [Op.like]: `%${search}%` };
        }

        let order = [['createdAt', 'DESC']];
        if (sort === 'price_asc') order = [['price', 'ASC']];
        if (sort === 'price_desc') order = [['price', 'DESC']];
        if (sort === 'popular') order = [['salesCount', 'DESC']];

        const products = await Product.findAll({
            where,
            include: [{ model: User, as: 'Producer', attributes: ['id', 'name', 'artisticName', 'avatar'] }],
            order
        });

        res.json(products);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
};

exports.getProducerStore = async (req, res) => {
    try {
        const { username } = req.params;
        const { Op } = require('sequelize');
        let producer;

        if (!isNaN(username)) {
            producer = await User.findByPk(username);
        } else {
            producer = await User.findOne({
                where: {
                    [Op.or]: [
                        { artisticName: username },
                        { name: username },
                        sequelize.where(sequelize.fn('lower', sequelize.col('artisticName')), username.toLowerCase())
                    ]
                }
            });
        }

        if (!producer) return res.status(404).json({ error: 'Produtor não encontrado.' });

        const products = await Product.findAll({
            where: { producerId: producer.id, status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        const profile = {
            id: producer.id,
            name: producer.name,
            artisticName: producer.artisticName,
            bio: producer.bio,
            avatar: producer.avatar,
            banner: producer.banner,
            instagram: producer.instagram,
            youtube: producer.youtube
        };

        res.json({ producer: profile, products });
    } catch (error) {
        console.error("Erro ao carregar loja do produtor:", error);
        res.status(500).json({ error: 'Erro ao carregar loja.' });
    }
};

exports.getProducerSales = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find OrderItems where Product.producerId = userId
        // And include Order info (Buyer, Date)
        const sales = await OrderItem.findAll({
            include: [
                {
                    model: Product,
                    where: { producerId: userId },
                    attributes: ['title', 'price', 'coverPath']
                },
                {
                    model: Order,
                    include: [{ model: User, as: 'Buyer', attributes: ['name', 'email'] }],
                    where: { status: 'paid' }, // Only completed sales
                    attributes: ['id', 'createdAt', 'status']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Format for frontend
        const formattedSales = sales.map(item => ({
            id: item.Order.id,
            date: item.Order.createdAt,
            customer: item.Order.Buyer ? item.Order.Buyer.name : 'Desconhecido',
            product: item.Product.title,
            price: parseFloat(item.price), // stored price snapshot
            status: item.Order.status === 'paid' ? 'completed' : item.Order.status,
            commissionRate: item.commissionRate,
            producerAmount: item.producerAmount
        }));

        res.json(formattedSales);
    } catch (error) {
        console.error("Error fetching producer sales:", error);
        res.status(500).json({ error: "Erro ao buscar vendas." });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [{ model: User, as: 'Producer', attributes: ['id', 'name', 'artisticName', 'avatar'] }]
        });
        if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
};

exports.checkPurchase = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

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

        res.json({ hasPurchased: !!hasPurchased });
    } catch (error) {
        console.error("Erro ao verificar compra:", error);
        res.status(500).json({ error: 'Erro ao verificar compra.' });
    }
};

exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { producerId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar seus produtos.' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ where: { id, producerId: req.user.id } });

        if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

        if (product.salesCount > 0) {
            product.status = 'inactive';
            await product.save();
            return res.json({ message: 'Produto desativado (possui vendas).' });
        }

        await product.destroy();
        res.json({ message: 'Produto excluído.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
};

// [NEW] Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const producerId = req.user.id;
        const { Op } = require('sequelize');

        // 1. Total Revenue & Sales
        // Find all orders where items belong to this producer
        // Complexity: Orders have Items. Items have Product. Product has Producer.
        // Easier: Query OrderItems directly including Product where producerId matches.

        const salesItems = await OrderItem.findAll({
            include: [
                {
                    model: Product,
                    where: { producerId },
                    attributes: ['id', 'title', 'price']
                },
                {
                    model: Order,
                    where: { status: 'paid' },
                    attributes: ['createdAt']
                }
            ]
        });

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalCommission = 0;
        let totalSales = salesItems.length;

        // 2. Chart Data (Last 30 Days)
        const last30Days = {};
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last30Days[dateStr] = { name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), revenue: 0, sales: 0 };
        }

        salesItems.forEach(item => {
            const amount = parseFloat(item.price);
            const profit = parseFloat(item.producerAmount);
            const commission = amount - profit;

            totalRevenue += amount;
            totalProfit += profit;
            totalCommission += commission;

            const saleDate = item.Order.createdAt.toISOString().split('T')[0];
            if (last30Days[saleDate]) {
                last30Days[saleDate].revenue += amount;
                last30Days[saleDate].sales += 1;
            }
        });

        const chartData = Object.values(last30Days);

        // 3. Top Products
        const topProducts = await Product.findAll({
            where: { producerId },
            order: [['salesCount', 'DESC']],
            limit: 5,
            attributes: ['id', 'title', 'salesCount', 'coverPath']
        });

        // 4. Pending Balance (Wallet)
        const wallet = await req.user.getWallet();
        const pendingBalance = wallet ? parseFloat(wallet.balance) : 0;

        res.json({
            revenue: totalRevenue,
            sales: totalSales,
            profit: totalProfit,
            commission: totalCommission,
            pendingBalance, // [ADDED]
            topProducts,
            chartData
        });

    } catch (error) {
        console.error("Erro ao carregar stats:", error);
        res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { buyerId: req.user.id, status: 'paid' }, // Only paid orders
            include: [{
                model: OrderItem,
                include: [{ model: Product }]
            }],
            order: [['createdAt', 'DESC']]
        });

        // Transform for easier frontend consumption if needed, or send as is
        // Frontend expects: { id, date, items: [{ Product: {...} }] }
        // Sequalize structure is similar: Order -> OrderItems -> Product

        res.json(orders);
    } catch (error) {
        console.error("Erro ao buscar meus pedidos:", error);
        res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

exports.checkout = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { productId } = req.body;
        const buyerId = req.user.id;

        const product = await Product.findByPk(productId, { transaction: t });
        if (!product || product.status !== 'active') {
            await t.rollback();
            return res.status(404).json({ error: 'Produto indisponível.' });
        }

        // Check stock
        if (product.stock === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Produto esgotado.' });
        }

        const price = parseFloat(product.price);

        // Fetch buyer wallet
        let buyerWallet = await req.user.getWallet({ transaction: t });
        if (!buyerWallet) buyerWallet = await req.user.createWallet({}, { transaction: t });

        const currentBalance = parseFloat(buyerWallet.balance) || 0;

        if (currentBalance < price) {
            await t.rollback();
            return res.status(402).json({ error: 'Saldo insuficiente na carteira.' });
        }

        // Deduct from buyer
        buyerWallet.balance = currentBalance - price;
        await buyerWallet.save({ transaction: t });

        // Credit Producer (minus 10% fee for the platform)
        const feePercent = 0.10;
        const platformFee = price * feePercent;
        const producerAmount = price - platformFee;

        const { User } = require('../database');
        const producer = await User.findByPk(product.producerId, { transaction: t });
        let producerWallet = await producer.getWallet({ transaction: t });
        if (!producerWallet) producerWallet = await producer.createWallet({}, { transaction: t });

        producerWallet.balance = (parseFloat(producerWallet.balance) || 0) + producerAmount;
        await producerWallet.save({ transaction: t });

        // Create Order & Items
        const order = await Order.create({
            buyerId,
            totalAmount: price,
            status: 'paid'
        }, { transaction: t });

        await OrderItem.create({
            OrderId: order.id,
            ProductId: product.id,
            price: price,
            producerAmount: producerAmount,
            commissionRate: feePercent * 100
        }, { transaction: t });

        // Update product stats
        product.salesCount += 1;
        if (product.stock > 0) product.stock -= 1;
        await product.save({ transaction: t });

        await t.commit();
        res.status(200).json({ success: true, orderId: order.id });

    } catch (error) {
        await t.rollback();
        console.error("Erro no checkout:", error);
        res.status(500).json({ error: 'Erro ao processar o pagamento.' });
    }
};
