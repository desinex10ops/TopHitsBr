const { sequelize, Track, User } = require('./src/database');

async function syncPlayHistory() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Syncing PlayHistory...');
        const { PlayHistory } = require('./src/database');
        // Note: PlayHistory is not exported directly in database.js yet, need to fix that first.
        // Wait, I forgot to export PlayHistory in database.js in the previous step.
        // I will fix database.js export first.
    } catch (e) {
        console.error("Error:", e);
    }
}
