const { PlayHistory, Track, sequelize } = require('./src/database');

async function simulatePlays() {
    try {
        await sequelize.authenticate();

        // Get some tracks
        const tracks = await Track.findAll({ limit: 5 });
        if (tracks.length === 0) {
            console.log("No tracks found.");
            return;
        }

        console.log(`Simulating plays for ${tracks.length} tracks...`);

        // Track 1: 50 plays (Hot!)
        for (let i = 0; i < 50; i++) {
            await PlayHistory.create({ TrackId: tracks[0].id, ip: '127.0.0.1' });
        }
        console.log(`Track ${tracks[0].title} got 50 plays.`);

        // Track 2: 10 plays
        for (let i = 0; i < 10; i++) {
            await PlayHistory.create({ TrackId: tracks[1].id, ip: '127.0.0.1' });
        }
        console.log(`Track ${tracks[1].title} got 10 plays.`);

        // Force Cache Update
        const TrendingService = require('./src/services/TrendingService');
        await TrendingService.updateTrendingCache();
        console.log("Trending Cache Forced Update.");

    } catch (e) {
        console.error(e);
    }
}

simulatePlays();
