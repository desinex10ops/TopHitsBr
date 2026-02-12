const { initDb, Track } = require('./src/database');
const { Sequelize } = require('sequelize');

async function checkGenres() {
    await initDb();

    try {
        const genres = await Track.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('genre')), 'genre']],
            raw: true
        });

        console.log('--- Gêneros no Banco ---');
        console.log(genres);

        const allTracks = await Track.findAll({ attributes: ['id', 'title', 'genre'] });
        console.log('\n--- Amostra de Músicas ---');
        allTracks.forEach(t => console.log(`${t.title} -> Gênero: '${t.genre}'`));

    } catch (e) {
        console.error(e);
    }
}

checkGenres();
