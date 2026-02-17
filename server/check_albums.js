const { Track } = require('./src/database');

async function checkTrackAlbums() {
    try {
        console.log("--- Checking Track Albums ---");
        const tracks = await Track.findAll({ limit: 10 });
        tracks.forEach(t => {
            console.log(`Track: ${t.title}, Album: '${t.album}'`);
        });

        const tracksWithAlbum = await Track.count({ where: { album: { [require('sequelize').Op.ne]: null } } });
        console.log(`Tracks with Non-Null Album: ${tracksWithAlbum}`);

        const tracksWithEmptyAlbum = await Track.count({ where: { album: '' } });
        console.log(`Tracks with Empty String Album: ${tracksWithEmptyAlbum}`);

    } catch (error) {
        console.error("Error checking DB:", error);
    } finally {
        process.exit();
    }
}

checkTrackAlbums();
