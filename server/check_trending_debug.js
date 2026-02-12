const { PlayHistory, SystemSetting, sequelize } = require('./src/database');
const TrendingService = require('./src/services/TrendingService');

async function checkTrending() {
    try {
        await sequelize.authenticate();

        const count = await PlayHistory.count();
        console.log(`PlayHistory Count: ${count}`);

        const setting = await SystemSetting.findOne({ where: { key: 'trending_tracks_cache' } });
        console.log(`Cache Setting Found: ${!!setting}`);
        if (setting) {
            console.log(`Cache Value Length: ${setting.value.length}`);
            console.log(`Cache Value Preview: ${setting.value.substring(0, 100)}...`);
        }

        const trending = await TrendingService.getTrending();
        console.log(`TrendingService.getTrending() returned ${trending.length} items.`);

        if (trending.length > 0) {
            console.log("Top 1:", trending[0].title);
        }

    } catch (e) {
        console.error(e);
    }
}

checkTrending();
