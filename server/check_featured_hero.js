const FeaturedService = require('./src/services/FeaturedService');
const { initDb } = require('./src/database');

async function check() {
    await initDb();
    const artists = await FeaturedService.getFeaturedArtists();
    console.log(`Found ${artists.length} featured artists.`);
    artists.forEach(a => {
        console.log(`Artist: ${a.artisticName}`);
        console.log(` - BoostType: ${a.boostType}`);
        console.log(` - HeroTrack: ${a.heroTrack ? a.heroTrack.title : 'NONE'}`);
    });
}

check();
