const { Track, User, Album, sequelize } = require('./src/database');

async function check() {
    try {
        await sequelize.authenticate();
        const trackCount = await Track.count();
        const userCount = await User.count();
        const albumCount = await Album.count();

        console.log(`--- DB COUNTS ---`);
        console.log(`Users: ${userCount}`);
        console.log(`Albums: ${albumCount}`);
        console.log(`Tracks: ${trackCount}`);
        console.log(`-----------------`);
    } catch (e) {
        console.error(e);
    }
}

check();
