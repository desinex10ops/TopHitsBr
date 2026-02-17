const { sequelize, ArtistImage } = require('./src/database');

const populate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // Ensure table exists
        await ArtistImage.sync();

        // ID 4 based on user screenshot
        const artistId = 1;

        await ArtistImage.destroy({ where: { UserId: artistId } });

        await ArtistImage.bulkCreate([
            { UserId: artistId, url: 'https://placehold.co/600x600/1ed760/FFF?text=Show', caption: 'No Palco' },
            { UserId: artistId, url: 'https://placehold.co/600x600/202020/FFF?text=Studio', caption: 'Bastidores' },
            { UserId: artistId, url: 'https://placehold.co/600x600/3d91f4/FFF?text=Fans', caption: 'Com Fãs' },
            { UserId: artistId, url: 'https://placehold.co/600x600/e91429/FFF?text=Ensaio', caption: 'Ensaio' },
            { UserId: artistId, url: 'https://placehold.co/600x600/b91d88/FFF?text=Award', caption: 'Premiação' },
            { UserId: artistId, url: 'https://placehold.co/600x600/f59b23/FFF?text=Tour', caption: 'Turnê 2026' },
        ]);

        console.log('Gallery populated for Artist 4');

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

populate();
