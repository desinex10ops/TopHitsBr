const { Album, initDb } = require('./src/database');

async function fixCoverPaths() {
    await initDb();

    const albums = await Album.findAll();
    console.log("Checking albums for cover path fixes...");

    for (const album of albums) {
        if (album.cover && !album.cover.startsWith('covers/') && !album.cover.startsWith('http')) {
            // Assume it's a filename that belongs in covers/
            console.log(`Fixing album [${album.title}] cover path: ${album.cover}`);
            album.cover = `covers/${album.cover}`;
            await album.save();
            console.log(`-> Updates to: ${album.cover}`);
        }
    }
    console.log("Done.");
}

fixCoverPaths();
