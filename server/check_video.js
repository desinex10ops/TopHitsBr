const { Album, initDb } = require('./src/database');

async function checkVideos() {
    await initDb();

    const albums = await Album.findAll({
        attributes: ['id', 'title', 'video', 'cover']
    });

    console.log("--- ALBUMS WITH VIDEOS ---");
    const withVideo = albums.filter(a => a.video);
    withVideo.forEach(a => {
        console.log(`[ID: ${a.id}] ${a.title} | Video: ${a.video}`);
    });

    console.log("\n--- ALBUMS WITHOUT VIDEOS (Top 5) ---");
    const withoutVideo = albums.filter(a => !a.video).slice(0, 5);
    withoutVideo.forEach(a => {
        console.log(`[ID: ${a.id}] ${a.title} | Video: NULL`);
    });
}

checkVideos();
