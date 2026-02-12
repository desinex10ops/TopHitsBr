const { Track, Playlist, User, PlaylistTrack } = require('../database');
const { Sequelize } = require('sequelize');

exports.getAutoPlaylists = (req, res) => {
    // Lista estática de "tipos" de playlists que o sistema gera
    const playlists = [
        { id: 'random', title: '🔀 Aleatório', description: 'Uma mistura surpresa para você.', cover: 'default' },
        { id: 'top50', title: '🔥 Top 50', description: 'As músicas mais ouvidas da plataforma.', cover: 'default' },
        { id: 'recent', title: '🆕 Recentes', description: 'As últimas novidades adicionadas.', cover: 'default' },
        { id: 'vibe-paredao', title: '🔊 Paredão', description: 'Som automotivo para tremer tudo.', cover: 'default' },
        { id: 'vibe-rebaixado', title: '🚗 Rebaixado', description: 'Grave forte para curtir no carro.', cover: 'default' },
        { id: 'vibe-churrasco', title: '🥩 Churrasco', description: 'Aquele som para a resenha.', cover: 'default' },
        { id: 'vibe-sofrencia', title: '🍺 Sofrência', description: 'Para beber e chorar.', cover: 'default' }
    ];
    // Futuro: Adicionar playlists por Gênero dinamicamente aqui

    res.json(playlists);
};

exports.getPlaylistTracks = async (req, res) => {
    try {
        const { id } = req.params;
        let tracks = [];

        if (!isNaN(id)) {
            // É um ID numérico, buscar do banco
            const playlist = await Playlist.findByPk(id, {
                include: [Track]
            });
            if (!playlist) return res.status(404).json({ error: 'Playlist não encontrada' });
            return res.json(playlist.Tracks);
        }

        if (id === 'random') {
            tracks = await Track.findAll({
                order: [Sequelize.fn('RANDOM')],
                limit: 50
            });
        } else if (id === 'top50') {
            tracks = await Track.findAll({
                order: [['plays', 'DESC']],
                limit: 50
            });
        } else if (id === 'recent') {
            tracks = await Track.findAll({
                order: [['createdAt', 'DESC']],
                limit: 50
            });
        } else {
            // Tentar buscar por Gênero se o ID não for padrão
            // Ex: playlist-Forró -> busca genero Forró
            // Tentar buscar por Gênero se o ID não for padrão
            // Ex: playlist-Forró -> busca genero Forró
            if (id.startsWith('genre-')) {
                const genre = id.replace('genre-', '');
                tracks = await Track.findAll({
                    where: { genre: genre },
                    order: [Sequelize.fn('RANDOM')],
                    limit: 50
                });
            } else if (id.startsWith('vibe-')) {
                const vibe = id.split('-')[1]; // Ex: vibe-paredao -> paredao
                // Mapeamento simples de slugs para nomes reais se necessário, 
                // ou salvar no banco slugificado. Por simplicidade, vamos salvar "Paredão" no banco e buscar por like ou exato.
                // Mas o ideal para o seletor é ter valores fixos.
                // Vamos assumir que o ID 'vibe-paredao' busca por vibe 'Paredão' (case insensitive LIKE)

                let searchTerm = '';
                switch (vibe) {
                    case 'paredao': searchTerm = 'Paredão'; break;
                    case 'rebaixado': searchTerm = 'Rebaixado'; break;
                    case 'churrasco': searchTerm = 'Churrasco'; break;
                    case 'sofrencia': searchTerm = 'Sofrência'; break;
                    default: searchTerm = vibe;
                }

                tracks = await Track.findAll({
                    where: {
                        vibe: { [Sequelize.Op.like]: `%${searchTerm}%` }
                    },
                    order: [Sequelize.fn('RANDOM')],
                    limit: 50
                });
            } else {
                return res.status(404).json({ error: 'Playlist não encontrada' });
            }
        }

        res.json(tracks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar playlist.' });
    }
};

// --- User Playlists ---

exports.createUserPlaylist = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!name) return res.status(400).json({ error: 'Nome da playlist é obrigatório.' });

        const playlist = await Playlist.create({
            name,
            type: 'user',
            UserId: userId
        });

        res.status(201).json(playlist);
    } catch (error) {
        console.error("Erro criando playlist:", error);
        res.status(500).json({ error: 'Erro ao criar playlist.' });
    }
};

exports.getUserPlaylists = async (req, res) => {
    try {
        const userId = req.user.id;
        const playlists = await Playlist.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(playlists);
    } catch (error) {
        console.error("Erro buscando playlists:", error);
        res.status(500).json({ error: 'Erro ao buscar playlists.' });
    }
};

exports.addTrackToPlaylist = async (req, res) => {
    try {
        const { id } = req.params; // Playlist ID
        const { trackId } = req.body;

        const playlist = await Playlist.findByPk(id);
        if (!playlist) return res.status(404).json({ error: 'Playlist não encontrada.' });

        // Check ownership
        if (playlist.UserId !== req.user.id) return res.status(403).json({ error: 'Proibido.' });

        // Check availability
        const track = await Track.findByPk(trackId);
        if (!track) return res.status(404).json({ error: 'Música não encontrada.' });

        await playlist.addTrack(track);

        res.json({ message: 'Música adicionada!' });
    } catch (error) {
        console.error("Erro adicionando música:", error);
        res.status(500).json({ error: 'Erro ao adicionar música.' });
    }
};

exports.removeTrackFromPlaylist = async (req, res) => {
    try {
        const { id, trackId } = req.params;

        const playlist = await Playlist.findByPk(id);
        if (!playlist) return res.status(404).json({ error: 'Playlist não encontrada.' });

        if (playlist.UserId !== req.user.id) return res.status(403).json({ error: 'Proibido.' });

        const track = await Track.findByPk(trackId);
        if (!track) return res.status(404).json({ error: 'Música não encontrada.' });

        await playlist.removeTrack(track);

        res.json({ message: 'Música removida!' });
    } catch (error) {
        console.error("Erro removendo música:", error);
        res.status(500).json({ error: 'Erro ao remover música.' });
    }
};

exports.getTopPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            where: { type: 'user' },
            include: [{
                model: User,
                attributes: ['name', 'artisticName', 'avatar']
            }],
            order: [['plays', 'DESC']],
            limit: 10
        });
        res.json(playlists);
    } catch (error) {
        console.error("Erro buscando top playlists:", error);
        res.status(500).json({ error: 'Erro ao buscar top playlists.' });
    }
};

exports.incrementPlaylistPlays = async (req, res) => {
    try {
        const { id } = req.params;
        await Playlist.increment('plays', { where: { id } });
        res.json({ message: 'Play registrado' });
    } catch (error) {
        console.error("Erro registrando play:", error);
        res.status(500).json({ error: 'Erro ao registrar play.' });
    }
};

exports.uploadPlaylistCover = async (req, res) => {
    try {
        console.log('[UploadPlaylistCover] Start');
        const { id } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            console.log('[UploadPlaylistCover] No file received');
            return res.status(400).json({ error: 'Nenhuma imagem recebida pelo servidor.' });
        }
        console.log('[UploadPlaylistCover] File:', req.file);

        const playlist = await Playlist.findByPk(id);
        if (!playlist) {
            console.log('[UploadPlaylistCover] Playlist not found');
            return res.status(404).json({ error: 'Playlist não encontrada.' });
        }

        if (playlist.UserId !== userId) {
            console.log('[UploadPlaylistCover] User Forbidden');
            return res.status(403).json({ error: 'Sem permissão.' });
        }

        // Multer saves to storage/covers, so we need to save 'covers/filename' in DB
        playlist.cover = `covers/${req.file.filename}`;
        await playlist.save();
        console.log('[UploadPlaylistCover] Success:', playlist.cover);

        res.json({ message: 'Capa atualizada com sucesso!', cover: playlist.cover });

    } catch (error) {
        console.error("Erro no upload da capa da playlist:", error);
        res.status(500).json({ error: 'Erro interno no upload.' });
    }
};
