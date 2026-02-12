const { Album, initDb } = require('./src/database');

async function fixVideoPaths() {
    await initDb();

    const albums = await Album.findAll();
    console.log("Checking albums for video path fixes...");

    for (const album of albums) {
        if (album.video && !album.video.startsWith('music/')) {
            console.log(`Fixing album [${album.title}] video path: ${album.video}`);
            album.video = `music/${album.video}`;
            await album.save();
            console.log(`-> Updates to: ${album.video}`);
        }
    }
    console.log("Done.");
}

fixVideoPaths();
