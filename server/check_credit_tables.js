const { sequelize } = require('./src/database');

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='CreditPackages';");
        console.log('Table exists:', results.length > 0);
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

check();
