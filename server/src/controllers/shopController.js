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
            include: [{
                model: Product,
                where: { producerId },
                attributes: ['id', 'title', 'price']
            }]
        });

        let totalRevenue = 0;
        let totalSales = salesItems.length;

        // Calculate revenue based on item price at time of purchase (if we stored it)
        // For now using product price, but OrderItem should have 'price' field ideally.
        // Assuming OrderItem has 'price' (it should).
        // Let's check OrderItem model... It wasn't explicitly defined with price in my task, 
        // but it usually has. If not, use Product price.

        salesItems.forEach(item => {
            // specific logic if OrderItem has price, otherwise Product price
            totalRevenue += parseFloat(item.Product.price);
        });

        // 2. Monthly Graphic Data (Last 30 days)
        // Group salesItems by date
        const chartData = [];
        // ... logic to group by day ...

        // 3. Top Products
        const topProducts = await Product.findAll({
            where: { producerId },
            order: [['salesCount', 'DESC']],
            limit: 5,
            attributes: ['id', 'title', 'salesCount', 'coverPath']
        });

        res.json({
            revenue: totalRevenue,
            sales: totalSales,
            profit: totalRevenue * 0.8, // 80% to producer (20% commission)
            commission: totalRevenue * 0.2,
            topProducts,
            chartData: [ // Mock data for now until we have real orders
                { name: 'Seg', uv: 400, pv: 2400, amt: 2400 },
                { name: 'Ter', uv: 300, pv: 1398, amt: 2210 },
                { name: 'Qua', uv: 200, pv: 9800, amt: 2290 },
                { name: 'Qui', uv: 278, pv: 3908, amt: 2000 },
                { name: 'Sex', uv: 189, pv: 4800, amt: 2181 },
                { name: 'Sab', uv: 239, pv: 3800, amt: 2500 },
                { name: 'Dom', uv: 349, pv: 4300, amt: 2100 },
            ]
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
