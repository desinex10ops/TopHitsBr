const { Playlist, Track, User, PlaylistTrack, Sequelize } = require('../database');
const { Op } = require('sequelize');

class PlaylistRepository {
    async findById(id) {
        return await Playlist.findByPk(id, { include: [Track] });
    }

    async findByUser(userId) {
        return await Playlist.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });
    }

    async create(data) {
        return await Playlist.create(data);
    }

    async findTopPlaylists(limit = 10) {
        return await Playlist.findAll({
            where: { type: 'user' },
            include: [{
                model: User,
                attributes: ['name', 'artisticName', 'avatar']
            }],
            order: [['plays', 'DESC']],
            limit
        });
    }

    async incrementPlays(id) {
        return await Playlist.increment('plays', { where: { id } });
    }

    async addTrack(playlist, track) {
        return await playlist.addTrack(track);
    }

    async removeTrack(playlist, track) {
        return await playlist.removeTrack(track);
    }

    async findRandomTracks(limit = 50) {
        return await Track.findAll({
            order: [Sequelize.fn('RANDOM')],
            limit
        });
    }

    async findTopTracks(limit = 50) {
        return await Track.findAll({
            order: [['plays', 'DESC']],
            limit
        });
    }

    async findRecentTracks(limit = 50) {
        return await Track.findAll({
            order: [['createdAt', 'DESC']],
            limit
        });
    }

    async findTracksByGenre(genre, limit = 50) {
        return await Track.findAll({
            where: { genre },
            order: [Sequelize.fn('RANDOM')],
            limit
        });
    }

    async findTracksByVibe(searchTerm, limit = 50) {
        return await Track.findAll({
            where: {
                vibe: { [Op.like]: `%${searchTerm}%` }
            },
            order: [Sequelize.fn('RANDOM')],
            limit
        });
    }

    async findByName(query, limit = 20) {
        return await Playlist.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ],
                type: 'user' // Only search user playlists for now, or remove validation to search all
            },
            include: [{
                model: User,
                attributes: ['name', 'artisticName', 'avatar']
            }],
            limit
        });
    }
}

module.exports = new PlaylistRepository();
