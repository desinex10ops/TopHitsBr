const { sequelize, Wallet, CreditTransaction, CreditPackage, Boost } = require('./src/database');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        await Wallet.sync({ alter: true });
        console.log('Wallet synced.');

        await CreditTransaction.sync({ alter: true });
        console.log('CreditTransaction synced.');

        await CreditPackage.sync({ alter: true });
        console.log('CreditPackage synced.');

        await Boost.sync({ alter: true });
        console.log('Boost synced.');

    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
