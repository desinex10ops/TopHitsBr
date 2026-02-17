const PlaylistRepository = require('../repositories/PlaylistRepository');
const MusicRepository = require('../repositories/MusicRepository'); // Reusing for findTrackById
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');

class PlaylistService {
    constructor() {
        this.storagePath = path.join(__dirname, '../../storage');
        this.autoPlaylists = [
            { id: 'random', title: '🔀 Aleatório', description: 'Uma mistura surpresa para você.', cover: 'default' },
            { id: 'top50', title: '🔥 Top 50', description: 'As músicas mais ouvidas da plataforma.', cover: 'default' },
            { id: 'recent', title: '🆕 Recentes', description: 'As últimas novidades adicionadas.', cover: 'default' },
            { id: 'vibe-paredao', title: '🔊 Paredão', description: 'Som automotivo para tremer tudo.', cover: 'default' },
            { id: 'vibe-rebaixado', title: '🚗 Rebaixado', description: 'Grave forte para curtir no carro.', cover: 'default' },
            { id: 'vibe-churrasco', title: '🥩 Churrasco', description: 'Aquele som para a resenha.', cover: 'default' },
            { id: 'vibe-sofrencia', title: '🍺 Sofrência', description: 'Para beber e chorar.', cover: 'default' }
        ];
    }

    getAutoPlaylists() {
        return this.autoPlaylists;
    }

    async getPlaylistTracks(id) {
        // 1. Database Playlist (Numeric ID)
        if (!isNaN(id)) {
            const playlist = await PlaylistRepository.findById(id);
            if (!playlist) throw new AppError('Playlist não encontrada', 404);
            return playlist.Tracks;
        }

        // 2. Auto Playlists
        if (id === 'random') return await PlaylistRepository.findRandomTracks();
        if (id === 'top50') return await PlaylistRepository.findTopTracks();
        if (id === 'recent') return await PlaylistRepository.findRecentTracks();

        // 3. Dynamic Genre/Vibe
        if (id.startsWith('genre-')) {
            const genre = id.replace('genre-', '');
            return await PlaylistRepository.findTracksByGenre(genre);
        }

        if (id.startsWith('vibe-')) {
            const vibeSlug = id.split('-')[1];
            const vibeMap = {
                'paredao': 'Paredão',
                'rebaixado': 'Rebaixado',
                'churrasco': 'Churrasco',
                'sofrencia': 'Sofrência'
            };
            const searchTerm = vibeMap[vibeSlug] || vibeSlug;
            return await PlaylistRepository.findTracksByVibe(searchTerm);
        }

        throw new AppError('Playlist não encontrada', 404);
    }

    async createUserPlaylist(userId, name) {
        if (!name) throw new AppError('Nome da playlist é obrigatório.', 400);
        return await PlaylistRepository.create({ name, type: 'user', UserId: userId });
    }

    async getUserPlaylists(userId) {
        return await PlaylistRepository.findByUser(userId);
    }

    async addTrackToPlaylist(userId, playlistId, trackId) {
        const playlist = await PlaylistRepository.findById(playlistId);
        if (!playlist) throw new AppError('Playlist não encontrada.', 404);
        if (playlist.UserId !== userId) throw new AppError('Proibido.', 403);

        const track = await MusicRepository.findTrackById(trackId);
        if (!track) throw new AppError('Música não encontrada.', 404);

        await PlaylistRepository.addTrack(playlist, track);
    }

    async removeTrackFromPlaylist(userId, playlistId, trackId) {
        const playlist = await PlaylistRepository.findById(playlistId);
        if (!playlist) throw new AppError('Playlist não encontrada.', 404);
        if (playlist.UserId !== userId) throw new AppError('Proibido.', 403);

        const track = await MusicRepository.findTrackById(trackId);
        if (!track) throw new AppError('Música não encontrada.', 404);

        await PlaylistRepository.removeTrack(playlist, track);
    }

    async getTopPlaylists() {
        return await PlaylistRepository.findTopPlaylists();
    }

    async incrementPlays(id) {
        await PlaylistRepository.incrementPlays(id);
    }

    async uploadCover(userId, playlistId, file) {
        if (!file) throw new AppError('Nenhuma imagem recebida.', 400);

        const playlist = await PlaylistRepository.findById(playlistId);
        if (!playlist) throw new AppError('Playlist não encontrada.', 404);
        if (playlist.UserId !== userId) throw new AppError('Sem permissão.', 403);

        // TODO: Delete old cover if custom
        playlist.cover = `covers/${file.filename}`; // Assuming Multer Logic matches
        await playlist.save(); // Direct save as Repo update might be overkill for one field? Or should add Repo method?
        // Ideally: await PlaylistRepository.update(playlist, { cover: ... })

        return playlist.cover;
    }

    async searchPlaylists(query) {
        if (!query) return [];
        return await PlaylistRepository.findByName(query);
    }
}

module.exports = new PlaylistService();
