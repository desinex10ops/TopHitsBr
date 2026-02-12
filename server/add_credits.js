const { User, Wallet, initDb } = require('./src/database');

async function addCredits() {
    await initDb();
    const email = 'marcelotemplates@gmail.com';
    const amount = 100000;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }

        let wallet = await Wallet.findOne({ where: { UserId: user.id } });
        if (!wallet) {
            wallet = await Wallet.create({ UserId: user.id, balance: 0 });
            console.log('Created new wallet');
        }

        wallet.balance += amount;
        await wallet.save();

        console.log(`✅ Adicionado ${amount} créditos para ${email}`);
        console.log(`💰 Saldo atual: ${wallet.balance}`);

    } catch (error) {
        console.error('Erro:', error);
    }
}

addCredits();
