const PlaylistService = require('../services/PlaylistService');

exports.getAutoPlaylists = (req, res) => {
    // Static list
    const playlists = PlaylistService.getAutoPlaylists();
    res.json(playlists);
};

exports.getPlaylistTracks = async (req, res, next) => {
    try {
        const tracks = await PlaylistService.getPlaylistTracks(req.params.id);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

exports.createUserPlaylist = async (req, res, next) => {
    try {
        const playlist = await PlaylistService.createUserPlaylist(req.user.id, req.body.name);
        res.status(201).json(playlist);
    } catch (error) {
        next(error);
    }
};

exports.getUserPlaylists = async (req, res, next) => {
    try {
        const playlists = await PlaylistService.getUserPlaylists(req.user.id);
        res.json(playlists);
    } catch (error) {
        next(error);
    }
};

exports.addTrackToPlaylist = async (req, res, next) => {
    try {
        await PlaylistService.addTrackToPlaylist(req.user.id, req.params.id, req.body.trackId);
        res.json({ message: 'Música adicionada!' });
    } catch (error) {
        next(error);
    }
};

exports.removeTrackFromPlaylist = async (req, res, next) => {
    try {
        await PlaylistService.removeTrackFromPlaylist(req.user.id, req.params.id, req.params.trackId);
        res.json({ message: 'Música removida!' });
    } catch (error) {
        next(error);
    }
};

exports.getTopPlaylists = async (req, res, next) => {
    try {
        const playlists = await PlaylistService.getTopPlaylists();
        res.json(playlists);
    } catch (error) {
        next(error);
    }
};

exports.incrementPlaylistPlays = async (req, res, next) => {
    try {
        await PlaylistService.incrementPlays(req.params.id);
        res.json({ message: 'Play registrado' });
    } catch (error) {
        next(error);
    }
};

exports.uploadPlaylistCover = async (req, res, next) => {
    try {
        const cover = await PlaylistService.uploadCover(req.user.id, req.params.id, req.file);
        res.json({ message: 'Capa atualizada com sucesso!', cover });
    } catch (error) {
        next(error);
    }
};

exports.searchPlaylists = async (req, res, next) => {
    try {
        const { search } = req.query;
        const playlists = await PlaylistService.searchPlaylists(search);
        res.json(playlists);
    } catch (error) {
        next(error);
    }
};
