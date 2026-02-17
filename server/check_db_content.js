const { Track, Product, User } = require('./src/database');

async function checkTracks() {
    try {
        console.log("--- Checking Tracks in DB ---");
        const count = await Track.count();
        console.log(`Total Tracks: ${count}`);

        const tracks = await Track.findAll({ limit: 5, include: [User] });
        if (tracks.length > 0) {
            tracks.forEach(t => console.log(`Track: ${t.title} by ${t.User ? t.User.name : 'Unknown'}`));
        } else {
            console.log("No tracks found!");
        }

        console.log("\n--- Checking Products (if used for albums) ---");
        const products_count = await Product.count();
        console.log(`Total Products: ${products_count}`);

    } catch (error) {
        console.error("Error checking DB:", error);
    } finally {
        process.exit();
    }
}

checkTracks();
