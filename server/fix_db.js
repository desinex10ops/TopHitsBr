const { Playlist, sequelize } = require('./src/database');

const fix = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        await Playlist.sync({ alter: true });
        console.log('Playlist Schema Updated Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fix();
