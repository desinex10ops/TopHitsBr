const fs = require('fs');
const path = require('path');
const { initDb, Track, Album } = require('./src/database');

async function audit() {
    await initDb();
    console.log('--- Auditing Assets ---');

    const tracks = await Track.findAll();
    console.log(`Found ${tracks.length} tracks.`);

    let missingCovers = 0;
    let missingAudio = 0;

    for (const track of tracks) {
        if (track.coverpath) {
            // Clean path logic mirroring urlUtils slightly for checking
            let relativePath = track.coverpath.replace(/\\/g, '/');
            if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
            if (relativePath.startsWith('storage/')) relativePath = relativePath.substring(8);

            const fullPath = path.join(__dirname, 'storage', relativePath);
            if (!fs.existsSync(fullPath)) {
                console.error(`[MISSING COVER] ID ${track.id}: ${track.title} -> ${fullPath}`);
                missingCovers++;
            }
        }

        if (track.filepath) {
            let relativePath = track.filepath.replace(/\\/g, '/');
            if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
            if (relativePath.startsWith('storage/')) relativePath = relativePath.substring(8);

            const fullPath = path.join(__dirname, 'storage', relativePath);
            if (!fs.existsSync(fullPath)) {
                console.error(`[MISSING AUDIO] ID ${track.id}: ${track.title} -> ${fullPath}`);
                missingAudio++;
            }
        }
    }

    console.log('--- Summary ---');
    console.log(`Missing Covers: ${missingCovers}`);
    console.log(`Missing Audio: ${missingAudio}`);
    process.exit(0);
}

audit().catch(console.error);
