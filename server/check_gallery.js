const { sequelize, ArtistImage } = require('./src/database');

const check = async () => {
    try {
        await sequelize.authenticate();
        const images = await ArtistImage.findAll({ where: { UserId: 4 } });
        console.log(`Found ${images.length} images for Artist 4`);
        images.forEach(img => console.log(img.url));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

check();
