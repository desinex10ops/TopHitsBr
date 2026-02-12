const { initDb, sequelize } = require('./src/database');

async function sync() {
    try {
        await initDb();
        console.log('Sync completed.');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
