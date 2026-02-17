const MusicService = require('../services/MusicService');

exports.uploadTrack = async (req, res, next) => {
    try {
        const track = await MusicService.uploadTrack(req.user.id, req.body, req.files);
        res.status(201).json(track);
    } catch (error) {
        next(error);
    }
};

exports.getAllTracks = async (req, res, next) => {
    try {
        const tracks = await MusicService.getAllTracks(req.query);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

exports.getMyTracks = async (req, res, next) => {
    try {
        const tracks = await MusicService.getMyTracks(req.user.id);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

exports.getGenres = async (req, res, next) => {
    try {
        const genres = await MusicService.getGenres();
        res.json(genres);
    } catch (error) {
        next(error);
    }
};

exports.getTracksByGenre = async (req, res, next) => {
    try {
        const tracks = await MusicService.getTracksByGenre(req.params.genre);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

exports.deleteTrack = async (req, res, next) => {
    try {
        await MusicService.deleteTrack(req.params.id);
        res.json({ message: 'Música excluída com sucesso.' });
    } catch (error) {
        next(error);
    }
};

exports.updateTrack = async (req, res, next) => {
    try {
        const coverFile = req.files && req.files['cover'] ? req.files['cover'][0] : null;
        const track = await MusicService.updateTrack(req.params.id, req.body, coverFile);
        res.json({ message: 'Música atualizada.', track });
    } catch (error) {
        next(error);
    }
};

exports.updateTrackKaraoke = async (req, res, next) => {
    try {
        const karaokeFile = req.files && req.files['karaoke'] ? req.files['karaoke'][0] : null;
        const track = await MusicService.updateKaraoke(req.params.id, req.body.lyrics, karaokeFile);
        res.json({ message: 'Karaokê atualizado.', track });
    } catch (error) {
        next(error);
    }
};
