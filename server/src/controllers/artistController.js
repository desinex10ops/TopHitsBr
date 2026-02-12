const { User, Track, ArtistNews } = require('../database');
const { Op } = require('sequelize');

exports.getArtistProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar dados do Artista
        const artist = await User.findByPk(id, {
            attributes: ['id', 'name', 'artisticName', 'avatar', 'banner', 'bio', 'instagram', 'youtube', 'tiktok', 'stats']
        });

        if (!artist) {
            return res.status(404).json({ error: 'Artista não encontrado.' });
        }

        // 2. Buscar Músicas Populares (Top 5)
        const popularTracks = await Track.findAll({
            where: { UserId: id },
            order: [['plays', 'DESC']],
            limit: 5
        });

        // 3. Buscar Discografia (Agrupada por Álbum)
        // Como o SQLite/Sequelize pode ser chato com GROUP BY complexo retornando objetos completos,
        // vamos buscar todas as faixas e agrupar no código ou buscar grupos.
        // Opção mais simples: Buscar todas as faixas (se não forem milhares) e agrupar.
        const allTracks = await Track.findAll({
            where: { UserId: id },
            attributes: ['id', 'title', 'album', 'coverpath', 'createdAt', 'genre'],
            order: [['createdAt', 'DESC']]
        });

        const albumsMap = {};
        const singles = [];

        allTracks.forEach(track => {
            if (track.album && track.album !== 'Single' && track.album !== track.title) {
                if (!albumsMap[track.album]) {
                    albumsMap[track.album] = {
                        name: track.album,
                        cover: track.coverpath,
                        year: new Date(track.createdAt).getFullYear(),
                        tracks: []
                    };
                }
                albumsMap[track.album].tracks.push(track);
            } else {
                singles.push(track);
            }
        });

        const albums = Object.values(albumsMap);

        // 4. Buscar Notícias
        const news = await ArtistNews.findAll({
            where: { UserId: id },
            order: [['date', 'DESC']],
            limit: 3
        });

        res.json({
            artist,
            popular: popularTracks,
            albums,
            singles,
            news
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao carregar perfil do artista.' });
    }
};

// Endpoint simples para criar notícia (apenas para teste/admin por enquanto)
exports.createNews = async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const userId = req.user.id; // Do middleware de auth

        const news = await ArtistNews.create({
            title,
            content,
            image,
            UserId: userId
        });

        res.json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar notícia.' });
    }
};

// Obter Estatísticas do Artista (Dashboard)
exports.getArtistStats = async (req, res) => {
    try {
        const userId = req.user.id; // Do middleware (auth)

        // 1. Total de Plays (Soma de plays de todas as tracks)
        const totalPlays = await Track.sum('plays', { where: { UserId: userId } }) || 0;

        // 2. Total de Uploads
        const uploads = await Track.count({ where: { UserId: userId } });

        // 3. Total de Seguidores
        const user = await User.findByPk(userId);
        const followers = await user.countFollowers();

        // 4. Músicas Mais Ouvidas (Top 5)
        const topTracks = await Track.findAll({
            where: { UserId: userId },
            order: [['plays', 'DESC']],
            limit: 5,
            attributes: ['title', 'plays']
        });

        const stats = {
            totalPlays,
            followers,
            uploads,
            topTracks: topTracks.map(t => ({ name: t.title, plays: t.plays }))
        };

        res.json(stats);

    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
    }
};
