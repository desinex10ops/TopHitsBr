const { sequelize, Order, CreditPackage, Wallet, CreditTransaction, User } = require('./src/database');

async function testCreditPurchase() {
    console.log('--- Iniciando teste de compra de créditos ---');

    try {
        // 1. Garantir que existam dados de teste
        const pkg = await CreditPackage.findOne();
        if (!pkg) {
            console.error('Erro: Nenhum pacote de créditos encontrado no banco.');
            return;
        }
        console.log(`Pacote encontrado: ${pkg.name} (${pkg.credits} créditos por R$ ${pkg.price})`);

        const user = await User.findOne({ where: { type: 'artist' } }) || await User.findOne();
        if (!user) {
            console.error('Erro: Nenhum usuário encontrado no banco.');
            return;
        }
        console.log(`Usuário selecionado: ${user.name} (ID: ${user.id})`);

        // 2. Criar um pedido de créditos manual (simulando createCreditPreference)
        const order = await Order.create({
            buyerId: user.id,
            total: pkg.price,
            status: 'pending',
            orderType: 'credits',
            packageId: pkg.id,
            paymentMethod: 'mercadopago'
        });
        console.log(`Pedido criado: ID ${order.id}, Status: ${order.status}`);

        // 3. Simular o Webhook (Lógica do paymentController.handleWebhook para créditos)
        console.log('Simulando recebimento de pagamento aprovado...');
        const t = await sequelize.transaction();

        try {
            const orderToUpdate = await Order.findByPk(order.id, { transaction: t });
            orderToUpdate.status = 'paid';
            orderToUpdate.paymentId = 'TEST-MP-' + Date.now();
            await orderToUpdate.save({ transaction: t });

            const pkgToFulfill = await CreditPackage.findByPk(orderToUpdate.packageId, { transaction: t });

            let wallet = await Wallet.findOne({ where: { UserId: orderToUpdate.buyerId }, transaction: t });
            if (!wallet) {
                wallet = await Wallet.create({ UserId: orderToUpdate.buyerId }, { transaction: t });
            }

            const oldCredits = wallet.credits || 0;
            await wallet.increment('credits', { by: pkgToFulfill.credits, transaction: t });

            await CreditTransaction.create({
                WalletId: wallet.id,
                amount: pkgToFulfill.credits,
                type: 'purchase',
                description: `Teste Compra de Pacote: ${pkgToFulfill.name}`,
                referenceId: orderToUpdate.paymentId
            }, { transaction: t });

            await t.commit();
            console.log('Transação de teste concluída no banco!');

            // 4. Verificar Resultados
            const updatedWallet = await Wallet.findOne({ where: { UserId: user.id } });
            console.log(`--- Resultados ---`);
            console.log(`Créditos anteriores: ${oldCredits}`);
            console.log(`Créditos atuais: ${updatedWallet.credits}`);
            console.log(`Diferença: ${updatedWallet.credits - oldCredits} (Esperado: ${pkgToFulfill.credits})`);

            if (updatedWallet.credits - oldCredits === pkgToFulfill.credits) {
                console.log('SUCESSO: O fluxo de créditos está funcionando corretamente!');
            } else {
                console.error('FALHA: O saldo de créditos não bate com o esperado.');
            }

        } catch (error) {
            await t.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Erro durante o teste:', error);
    } finally {
        await sequelize.close();
    }
}

testCreditPurchase();
