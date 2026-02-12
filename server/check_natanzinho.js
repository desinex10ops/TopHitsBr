const { sequelize, Track } = require('./src/database');

const check = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const tracks = await Track.findAll({
            where: {
                artist: 'Natanzinho Lima'
            }
        });

        console.log(`Found ${tracks.length} tracks for Natanzinho Lima.`);
        tracks.forEach(t => {
            console.log(`ID: ${t.id} | Title: ${t.title} | Album: ${t.album} | Cover: ${t.coverpath}`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
};

check();
