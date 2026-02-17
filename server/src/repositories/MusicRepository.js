const { Track, Album, Sequelize } = require('../database');
const { Op } = require('sequelize');

class MusicRepository {
    async createTrack(trackData) {
        return await Track.create(trackData);
    }

    async findTrackById(id) {
        return await Track.findByPk(id);
    }

    async findAllTracks(options = {}) {
        return await Track.findAll(options);
    }

    async deleteTrack(track) {
        return await track.destroy();
    }

    async findOrCreateAlbum(where, defaults) {
        return await Album.findOrCreate({ where, defaults });
    }

    async getDistinctGenres() {
        const genres = await Track.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('genre')), 'genre']],
            where: { genre: { [Op.ne]: null } },
            order: [['genre', 'ASC']],
            raw: true
        });
        return genres.map(g => g.genre).filter(g => g);
    }

    async findTracksByGenre(genre) {
        return await Track.findAll({
            where: { genre },
            order: [['createdAt', 'DESC']]
        });
    }

    async findTracksByUser(userId) {
        return await Track.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });
    }
}

module.exports = new MusicRepository();
