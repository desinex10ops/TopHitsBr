const { Track, Album, User, SystemSetting, sequelize } = require('./src/database');

async function fixPaths() {
    try {
        await sequelize.authenticate();

        console.log("Fixing Tracks...");
        const tracks = await Track.findAll();
        for (const t of tracks) {
            let changed = false;

            // Fix double covers
            if (t.coverpath && t.coverpath.includes('covers/covers')) {
                t.coverpath = t.coverpath.replace('covers/covers', 'covers');
                changed = true;
            }
            if (t.coverpath && t.coverpath.includes('covers\\covers')) {
                t.coverpath = t.coverpath.replace('covers\\covers', 'covers');
                changed = true;
            }

            // Normalize slashes
            if (t.coverpath && t.coverpath.includes('\\')) {
                t.coverpath = t.coverpath.replace(/\\/g, '/');
                changed = true;
            }
            if (t.filepath && t.filepath.includes('\\')) {
                t.filepath = t.filepath.replace(/\\/g, '/');
                changed = true;
            }

            if (changed) {
                console.log(`Fixing Track ${t.id}: ${t.coverpath}`);
                await t.save();
            }
        }

        console.log("Fixing Albums...");
        const albums = await Album.findAll();
        for (const a of albums) {
            let changed = false;
            if (a.cover && a.cover.includes('covers/covers')) {
                a.cover = a.cover.replace('covers/covers', 'covers');
                changed = true;
            }
            if (a.cover && a.cover.includes('covers\\covers')) {
                a.cover = a.cover.replace('covers\\covers', 'covers');
                changed = true;
            }
            if (a.cover && a.cover.includes('\\')) {
                a.cover = a.cover.replace(/\\/g, '/');
                changed = true;
            }
            if (changed) {
                console.log(`Fixing Album ${a.id}: ${a.cover}`);
                await a.save();
            }
        }

        console.log("Fixing Cache...");
        let setting = await SystemSetting.findOne({ where: { key: 'trending_tracks_cache' } });
        if (setting) {
            let cache = JSON.parse(setting.value);
            cache = cache.map(c => {
                if (c.coverpath && c.coverpath.includes('covers/covers')) c.coverpath = c.coverpath.replace('covers/covers', 'covers');
                if (c.coverpath && c.coverpath.includes('covers\\covers')) c.coverpath = c.coverpath.replace('covers\\covers', 'covers');
                if (c.coverpath) c.coverpath = c.coverpath.replace(/\\/g, '/');
                return c;
            });
            setting.value = JSON.stringify(cache);
            await setting.save();
            console.log("Cache fixed.");
        }

        console.log("Done.");

    } catch (e) {
        console.error(e);
    }
}

fixPaths();
