const { Boost, Album, Track, User, initDb } = require('./src/database');

async function checkActiveBoosts() {
    await initDb();

    // Simulate getActiveBoosts logic
    const boosts = await Boost.findAll({
        where: { status: 'active' },
        order: [['currentScore', 'DESC']]
    });

    console.log(`Found ${boosts.length} active boosts.`);

    const populatedBoosts = await Promise.all(boosts.map(async (boost) => {
        let item = null;
        if (boost.type === 'album') {
            item = await Album.findByPk(boost.targetId, {
                include: [{ model: User, attributes: ['name', 'artisticName'] }]
            });
            if (item) {
                item = item.toJSON();
                item.artist = item.User ? (item.User.artisticName || item.User.name) : 'Desconhecido';
                item.coverpath = item.cover;
                item.videopath = item.video; // Logic from controller
            }
        } else if (boost.type === 'track') {
            item = await Track.findByPk(boost.targetId, {
                include: [
                    { model: User, attributes: ['name', 'artisticName'] },
                    { model: Album, attributes: ['title', 'cover', 'video'] }
                ]
            });
            if (item) {
                item = item.toJSON();
                item.artist = item.artist || (item.User ? (item.User.artisticName || item.User.name) : 'Desconhecido');
                if (item.Album && item.Album.video) {
                    item.videopath = item.Album.video; // Logic from controller
                }
            }
        }

        if (!item) return null;

        return {
            id: boost.id,
            type: boost.type,
            targetId: boost.targetId,
            item_videopath: item.videopath, // This is what we care about
            item_title: item.title
        };
    }));

    console.log(JSON.stringify(populatedBoosts, null, 2));
}

checkActiveBoosts();
