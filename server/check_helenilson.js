const { Album, initDb } = require('./src/database');
const fs = require('fs');
const path = require('path');

async function checkHelenilson() {
    await initDb();

    // Find album with title like Helenilson
    const album = await Album.findOne({
        where: { title: 'Helenilson Santana' }
    });

    if (!album) {
        console.log("Album 'Helenilson Santana' not found.");
        return;
    }

    console.log(`[Album Detected] ID: ${album.id} | Title: ${album.title}`);
    console.log(`Cover Field in DB: ${album.cover}`);
    console.log(`Video Field in DB: ${album.video}`);

    // Check file existence
    if (album.cover) {
        // Multer code says covers go to 'storage/covers'
        // But albumController might save just filename or relative path.
        // Let's check both possibilities.

        const storageRoot = path.resolve(__dirname, 'storage');
        const coverPath = path.join(storageRoot, 'covers', path.basename(album.cover));

        console.log(`Checking path: ${coverPath}`);
        if (fs.existsSync(coverPath)) {
            console.log("✅ File exists at expected path.");
            console.log(`Size: ${fs.statSync(coverPath).size} bytes`);
        } else {
            console.log("❌ File NOT found at expected path.");

            // Try checking root storage just in case
            const rootPath = path.join(storageRoot, album.cover);
            if (fs.existsSync(rootPath)) {
                console.log(`⚠️ Found at root storage instead: ${rootPath}`);
            }
        }
    }
}

checkHelenilson();
