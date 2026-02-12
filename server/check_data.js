const { SystemSetting, Boost, Album, Track, sequelize } = require('./src/database');

async function checkData() {
    try {
        await sequelize.authenticate();

        const settings = await SystemSetting.findAll();
        console.log("--- SYSTEM SETTINGS ---");
        settings.forEach(s => console.log(`${s.key}: ${s.value}`));

        const boosts = await Boost.findAll({ where: { status: 'active' } });
        console.log("\n--- ACTIVE BOOSTS ---");
        console.log(`Count: ${boosts.length}`);
        boosts.forEach(b => console.log(`- ${b.type} (ID: ${b.targetId})`));

        const albums = await Album.findAll({ limit: 3 });
        console.log("\n--- SAMPLE ALBUMS ---");
        albums.forEach(a => console.log(`- ${a.title} | Cover: ${a.cover}`));

        const tracks = await Track.findAll({ limit: 3 });
        console.log("\n--- SAMPLE TRACKS ---");
        tracks.forEach(t => console.log(`- ${t.title} | Path: ${t.filepath} | Cover: ${t.coverpath}`));

    } catch (e) {
        console.error(e);
    }
}

checkData();
