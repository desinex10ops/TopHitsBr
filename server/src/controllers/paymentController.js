const { Product, Order, OrderItem, User, Wallet, Transaction, CommissionSetting, Coupon, sequelize } = require('../database');
const { Op } = require('sequelize');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const NotificationService = require('../services/NotificationService');
const emailService = require('../services/emailService');

// Helper function to execute split (to be reused by mock and webhook)
exports.executeSplit = async (orderId, transaction) => {
    const order = await Order.findByPk(orderId, {
        include: [{
            model: OrderItem,
            include: [{ model: Product, include: ['Producer'] }]
        }, { model: User, as: 'Buyer' }] // Include Buyer for email
    });

    if (!order || order.status !== 'paid') return;

    // Send Confirmation Email to Buyer
    try {
        if (order.Buyer && order.Buyer.email) {
            await emailService.notifyPurchase(order.Buyer, order, order.OrderItems);
        }
    } catch (emailError) {
        console.error('Falha ao enviar email de compra:', emailError);
    }

    // Get Commission Rate
    const setting = await CommissionSetting.findOne();
    const rate = setting ? setting.defaultRate : 10; // Default 10%

    for (const item of order.OrderItems) {
        const amount = parseFloat(item.price) * item.quantity;
        const producer = item.Product.Producer;

        if (!producer) continue;

        const platformFee = (amount * rate) / 100;
        const producerShare = amount - platformFee;

        // 1. Credit Producer Wallet
        const producerWallet = await Wallet.findOne({ where: { UserId: producer.id } });
        if (producerWallet) {
            // Add to PENDING balance first (safety) or available?
            // User requested "Liberação imediata", so maybe available?
            // Let's put in pending_balance and have a cron job or "immediate" flag.
            // For now, let's put in pending to be safe.
            await producerWallet.increment('pending_balance', { by: producerShare, transaction });
        } else {
            // Create wallet if missing (shouldn't happen for producers)
            await Wallet.create({
                UserId: producer.id,
                pending_balance: producerShare
            }, { transaction });
        }

        // 2. Register Producer Transaction (Credit)
        await Transaction.create({
            type: 'sale',
            amount: producerShare,
            status: 'completed',
            payeeId: producer.id,
            payerId: order.buyerId,
            productId: item.Product.id,
            description: `Venda: ${item.Product.title}`,
            paymentMethod: order.paymentMethod,
            metadata: {
                orderId: order.id,
                fullAmount: amount,
                platformFee,
                commissionRate: rate
            }
        }, { transaction });

        // NOTIFY PRODUCER
        try {
            NotificationService.sendToUser(producer.id, 'sale', {
                title: 'Nova Venda!',
                message: `Você vendeu "${item.Product.title}" e ganhou R$ ${producerShare.toFixed(2)}`,
                amount: producerShare,
                productId: item.Product.id
            });
            // Optional: Send email to producer too?
        } catch (notifError) {
            console.error('Falha ao enviar notificação (não bloqueante):', notifError);
        }
    }
};

// Initialize Mercado Pago Client
// TODO: User must set MP_ACCESS_TOKEN in .env
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN' });

exports.createCreditPreference = async (req, res) => {
    const { packageId } = req.body;
    const userId = req.user.id;

    try {
        const { CreditPackage } = require('../database');
        const pkg = await CreditPackage.findByPk(packageId);

        if (!pkg || !pkg.active) {
            return res.status(404).json({ error: 'Pacote de créditos não encontrado ou inativo.' });
        }

        const t = await sequelize.transaction();

        try {
            // Create Order for Credits
            const order = await Order.create({
                buyerId: userId,
                total: pkg.price,
                status: 'pending',
                orderType: 'credits',
                packageId: pkg.id,
                paymentMethod: 'mercadopago'
            }, { transaction: t });

            await t.commit();

            const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
            const API_URL = process.env.API_URL || 'http://localhost:3000';

            // Create Mercado Pago Preference
            const preference = new Preference(client);
            const result = await preference.create({
                body: {
                    items: [{
                        id: `PKG-${pkg.id}`,
                        title: `Pacote de Créditos: ${pkg.name}`,
                        quantity: 1,
                        unit_price: Number(pkg.price.toFixed(2)),
                        currency_id: 'BRL'
                    }],
                    payer: {
                        email: req.user.email,
                        name: req.user.name
                    },
                    back_urls: {
                        success: `${CLIENT_URL}/dashboard/wallet?status=success&order=${order.id}`,
                        failure: `${CLIENT_URL}/dashboard/wallet?status=failure`,
                        pending: `${CLIENT_URL}/dashboard/wallet?status=pending`
                    },
                    auto_return: 'approved',
                    external_reference: order.id.toString(),
                    notification_url: `${API_URL}/api/payment/webhook`
                }
            });

            res.json({
                id: order.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point
            });

        } catch (error) {
            await t.rollback();
            throw error;
        }

    } catch (error) {
        console.error("Erro ao comprar créditos:", error);
        res.status(500).json({ error: 'Erro ao processar pedido de créditos.' });
    }
};

exports.createPreference = async (req, res) => {
    const { items, buyerId, couponCode } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio.' });
    }

    const t = await sequelize.transaction();

    try {
        let total = 0;
        const products = [];
        const mpItems = [];

        // Validate Coupon
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({
                where: {
                    code: couponCode.toUpperCase(),
                    active: true,
                    [Op.or]: [
                        { validUntil: null },
                        { validUntil: { [Op.gt]: new Date() } }
                    ]
                }
            });
            // Optional: Check usage limit here or just rely on frontend/marketing validation
        }

        // Validate products and calculate total
        for (const item of items) {
            const product = await Product.findByPk(item.id);
            if (!product) continue;

            let unitPrice = parseFloat(product.price);

            // Apply Coupon Logic
            if (coupon) {
                let applies = false;
                // Rule 1: Specific Product
                if (coupon.productId && coupon.productId === product.id) {
                    if (coupon.producerId && coupon.producerId !== product.producerId) {
                        applies = false;
                    } else {
                        applies = true;
                    }
                }
                // Rule 2: Specific Producer
                else if (coupon.producerId && !coupon.productId && product.producerId === coupon.producerId) {
                    applies = true;
                }
                // Rule 3: Global
                else if (!coupon.producerId && !coupon.productId) {
                    applies = true;
                }

                if (applies) {
                    const discountAmount = (unitPrice * coupon.discountPercentage) / 100;
                    unitPrice -= discountAmount;
                    // Ensure price doesn't go negative
                    if (unitPrice < 0) unitPrice = 0;
                }
            }

            total += unitPrice * item.quantity;
            products.push({ product, quantity: item.quantity, finalPrice: unitPrice });

            mpItems.push({
                id: product.id.toString(),
                title: product.title,
                quantity: item.quantity,
                unit_price: Number(unitPrice.toFixed(2)), // MP requires 2 decimal places max usually
                currency_id: 'BRL'
            });
        }

        // Create Order in "pending" state
        const order = await Order.create({
            buyerId: buyerId || req.user.id,
            total,
            status: 'pending',
            paymentMethod: 'mercadopago'
        }, { transaction: t });

        // Get Commission Rate
        const setting = await CommissionSetting.findOne();
        const rate = setting ? parseFloat(setting.defaultRate) : 10; // Default 10%

        // Create Order Items
        for (const p of products) {
            const amount = p.finalPrice * p.quantity;
            const platformFee = (amount * rate) / 100;
            const producerShare = amount - platformFee;

            await OrderItem.create({
                OrderId: order.id,
                ProductId: p.product.id,
                quantity: p.quantity,
                price: p.finalPrice, // Discounted price
                commissionRate: rate,
                producerAmount: producerShare
            }, { transaction: t });
        }

        await t.commit();

        // Determine URLs based on environment
        const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
        const API_URL = process.env.API_URL || 'http://localhost:3000';

        // Create Preference in Mercado Pago
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: mpItems,
                payer: {
                    email: req.user.email, // Ensure req.user is populated by authMiddleware
                    name: req.user.name
                },
                back_urls: {
                    success: `${CLIENT_URL}/dashboard/purchases?status=success&order=${order.id}`,
                    failure: `${CLIENT_URL}/checkout?status=failure`,
                    pending: `${CLIENT_URL}/checkout?status=pending`
                },
                auto_return: 'approved',
                external_reference: order.id.toString(), // Link MP payment to our Order ID
                notification_url: `${API_URL}/api/payment/webhook` // Must be public URL for MP to reach
            }
        });

        res.json({
            id: order.id,
            init_point: result.init_point, // Real MP Checkout URL
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (error) {
        await t.rollback();
        console.error("Erro ao criar preferência de pagamento:", error);
        res.status(500).json({ error: 'Erro ao processar checkout no Mercado Pago.' });
    }
};

// Webhook to receive payment updates
exports.mockPaymentSuccess = async (req, res) => {
    const { orderId } = req.body;

    const t = await sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, { transaction: t });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
        if (order.status === 'paid') return res.status(400).json({ error: 'Pedido já pago' });

        // Update Order Status
        order.status = 'paid';
        order.paymentId = `MOCK-${Date.now()}`;
        await order.save({ transaction: t });

        // Process Split using the helper
        await exports.executeSplit(orderId, t);

        await t.commit();
        res.json({ message: 'Pagamento MOCK realizado com sucesso!', status: 'paid' });

    } catch (error) {
        await t.rollback();
        console.error("Erro no pagamento mock:", error);
        res.status(500).json({ error: 'Erro ao processar pagamento.' });
    }
};

exports.handleWebhook = async (req, res) => {
    const { type, data } = req.body;

    try {
        if (type === 'payment') {
            const paymentId = data.id;

            // Fetch Payment details from MP
            const { Payment } = require('mercadopago');
            const payment = new Payment(client);

            const paymentInfo = await payment.get({ id: paymentId });
            const orderId = paymentInfo.external_reference;
            const status = paymentInfo.status;

            console.log(`[Webhook] Payment ${paymentId} for Order ${orderId} status: ${status}`);

            if (status === 'approved') {
                const t = await sequelize.transaction();
                try {
                    const order = await Order.findByPk(orderId, { transaction: t });

                    if (order && order.status !== 'paid') {
                        order.status = 'paid';
                        order.paymentId = paymentId.toString();
                        await order.save({ transaction: t });

                        if (order.orderType === 'credits' && order.packageId) {
                            // Fulfill Credits
                            const { CreditPackage, CreditTransaction, Wallet } = require('../database');
                            const pkg = await CreditPackage.findByPk(order.packageId, { transaction: t });

                            if (pkg) {
                                let wallet = await Wallet.findOne({ where: { UserId: order.buyerId }, transaction: t });
                                if (!wallet) {
                                    wallet = await Wallet.create({ UserId: order.buyerId }, { transaction: t });
                                }

                                await wallet.increment('credits', { by: pkg.credits, transaction: t });

                                // Log Credit Transaction
                                await CreditTransaction.create({
                                    WalletId: wallet.id,
                                    amount: pkg.credits,
                                    type: 'purchase',
                                    description: `Compra de Pacote: ${pkg.name}`,
                                    referenceId: paymentId.toString()
                                }, { transaction: t });

                                // Notify User
                                try {
                                    NotificationService.sendToUser(order.buyerId, 'credits', {
                                        title: 'Créditos Adicionados!',
                                        message: `Você recebeu ${pkg.credits} créditos em sua conta.`,
                                        credits: pkg.credits
                                    });
                                } catch (e) {
                                    console.error('Notif error:', e);
                                }
                            }
                        } else {
                            // Process Split for Shop products
                            await exports.executeSplit(order.id, t);
                        }

                        await t.commit();
                        console.log(`[Webhook] Order ${orderId} (${order.orderType}) successfully processed.`);
                    } else {
                        await t.rollback();
                    }
                } catch (error) {
                    await t.rollback();
                    throw error;
                }
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Error");
    }
};
