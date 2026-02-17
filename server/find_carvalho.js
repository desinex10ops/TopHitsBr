const { sequelize, User } = require('./src/database');

const findArtist = async () => {
    try {
        await sequelize.authenticate();
        const artist = await User.findOne({
            where: { artisticName: 'Carvalho' }
        });

        if (artist) {
            console.log(`Found Carvalho: ID ${artist.id}`);
        } else {
            console.log('Carvalho not found. Listing all artists:');
            const all = await User.findAll({ attributes: ['id', 'artisticName'] });
            all.forEach(a => console.log(`${a.id}: ${a.artisticName}`));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

findArtist();
