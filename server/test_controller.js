const { initDb, Track } = require('./src/database');
const { Sequelize, Op } = require('sequelize');

async function testController() {
    await initDb();
    try {
        const genres = await Track.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('genre')), 'genre']],
            where: {
                genre: { [Op.ne]: null }
            },
            order: [['genre', 'ASC']]
        });

        console.log('--- Raw Result from Sequelize ---');
        console.log(JSON.stringify(genres, null, 2));

        const genreList = genres.map(g => g.getDataValue('genre'));
        console.log('--- Mapped List (getDataValue) ---');
        console.log(genreList);

        const genreListDirect = genres.map(g => g.genre);
        console.log('--- Mapped List (direct property) ---');
        console.log(genreListDirect);

    } catch (error) {
        console.error(error);
    }
}

testController();
