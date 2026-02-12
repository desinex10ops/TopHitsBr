const { sequelize, Track, Album, User } = require('./database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        // 1. Check for Orpahans
        const orphans = await Track.findAll({
            where: { AlbumId: null },
            include: [{ model: User, attributes: ['name', 'email'] }]
        });

        console.log(`\n=== ORPHAN TRACKS (AlbumId: null) ===`);
        console.log(`Count: ${orphans.length}`);
        orphans.forEach(t => {
            console.log(`[${t.id}] "${t.title}" by ${t.artist} (User: ${t.User ? t.User.name : 'None'}) - AlbumStr: "${t.album}"`);
        });

        // 2. Check Albums
        const albums = await Album.findAll({
            include: [{ model: User, attributes: ['name'] }]
        });
        console.log(`\n=== ALBUMS ===`);
        console.log(`Count: ${albums.length}`);
        albums.forEach(a => {
            console.log(`[${a.id}] "${a.title}" (User: ${a.User ? a.User.name : 'None'}) - Tracks: ?`);
        });

        // 3. Force Migration Logic (Dry Run or Real)
        if (orphans.length > 0) {
            console.log("\n[ACTION] Attempting to Migrate Orphans...");
            // Reuse logic from database.js roughly
            const userAlbums = {};

            for (const track of orphans) {
                if (!track.album || !track.UserId) {
                    console.log(`Skipping track ${track.id} (No Album Name or UserId)`);
                    continue;
                }

                if (!userAlbums[track.UserId]) userAlbums[track.UserId] = {};
                if (!userAlbums[track.UserId][track.album]) {
                    userAlbums[track.UserId][track.album] = {
                        cover: track.coverpath,
                        genre: track.genre,
                        tracks: []
                    };
                }
                userAlbums[track.UserId][track.album].tracks.push(track);
            }

            for (const userId in userAlbums) {
                for (const albumName in userAlbums[userId]) {
                    const data = userAlbums[userId][albumName];
                    console.log(`Processing User ${userId} -> Album "${albumName}" (${data.tracks.length} tracks)`);

                    // Find or Create Album
                    const [album, created] = await Album.findOrCreate({
                        where: {
                            title: albumName,
                            UserId: userId
                        },
                        defaults: {
                            cover: data.cover,
                            genre: data.genre,
                            description: `Álbum Migrado: ${albumName}`
                        }
                    });
                    console.log(`   -> Album ID: ${album.id} (Created: ${created})`);

                    // Update Tracks
                    for (const track of data.tracks) {
                        track.AlbumId = album.id;
                        await track.save();
                        console.log(`   -> Linked Track ${track.id}`);
                    }
                }
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        // await sequelize.close(); // Keep open if needed or close
    }
};

run();
