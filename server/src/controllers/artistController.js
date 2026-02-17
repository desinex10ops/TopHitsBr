const { sequelize, User, Track, ArtistNews, Album, ArtistImage } = require('../database');
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

        // --- NEW: Calculate Real Stats ---
        const totalPlays = await Track.sum('plays', { where: { UserId: id } }) || 0;
        const followersCount = await artist.countFollowers();

        // Update stats object (preserving other fields if any)
        const realStats = {
            ...artist.stats,
            plays: totalPlays,
            followers: followersCount
        };

        // --- NEW: Related Artists Logic ---
        let relatedArtists = [];
        if (popularTracks.length > 0) {
            // Find most common genre
            const genres = popularTracks.map(t => t.genre).filter(g => g);
            if (genres.length > 0) {
                const topGenre = genres.sort((a, b) =>
                    genres.filter(v => v === a).length - genres.filter(v => v === b).length
                ).pop();

                // Find other artists with tracks in this genre
                // This is a simplified approach. Ideally we'd aggregate.
                // We find tracks in this genre, from other artists, group by artist.
                const similarTracks = await Track.findAll({
                    where: {
                        genre: topGenre,
                        UserId: { [Op.ne]: id } // Not this artist
                    },
                    attributes: ['UserId'],
                    group: ['UserId'],
                    limit: 5
                });

                const relatedIds = similarTracks.map(t => t.UserId);

                if (relatedIds.length > 0) {
                    relatedArtists = await User.findAll({
                        where: { id: relatedIds },
                        attributes: ['id', 'artisticName', 'avatar']
                    });
                }
            }
        }

        if (relatedArtists.length < 5) {
            const randomArtists = await User.findAll({
                where: {
                    type: ['artist', 'producer'],
                    id: { [Op.ne]: id },
                    avatar: { [Op.ne]: null } // Ensure they have an avatar
                },
                order: sequelize.random(),
                attributes: ['id', 'artisticName', 'avatar'],
                limit: 5 - relatedArtists.length
            });
            relatedArtists = [...relatedArtists, ...randomArtists];
        }


        // 3. Buscar Discografia (Álbuns reais com IDs)
        const albums = await Album.findAll({
            where: { UserId: id },
            include: [{ model: Track, attributes: ['id', 'title', 'plays', 'duration', 'coverpath'] }],
            order: [['releaseDate', 'DESC']]
        });

        // 4. Buscar Singles (Músicas sem ÁlbumId ou com ÁlbumId mas que não queremos no grupo principal)
        const singles = await Track.findAll({
            where: {
                UserId: id,
                AlbumId: null
            },
            order: [['createdAt', 'DESC']]
        });

        // 5. Buscar Notícias
        const news = await ArtistNews.findAll({
            where: { UserId: id },
            order: [['date', 'DESC']],
            limit: 3
        });

        // 6. Buscar Galeria [NEW]
        const gallery = await ArtistImage.findAll({
            where: { UserId: id },
            order: [['order', 'ASC'], ['createdAt', 'DESC']],
            limit: 8
        });

        res.json({
            artist: { ...artist.toJSON(), stats: realStats }, // Return updated stats
            popular: popularTracks,
            albums: albums.map(a => ({
                ...a.toJSON(),
                year: a.releaseDate ? new Date(a.releaseDate).getFullYear() : '2023'
            })),
            singles,
            news,
            gallery, // NEW field
            relatedArtists // NEW field
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

exports.searchArtists = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) return res.json([]);

        const artists = await User.findAll({
            where: {
                type: ['artist', 'producer'], // Customize as needed
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { artisticName: { [Op.like]: `%${search}%` } }
                ]
            },
            attributes: ['id', 'name', 'artisticName', 'avatar'],
            limit: 20
        });

        res.json(artists);
    } catch (error) {
        console.error("Erro ao buscar artistas:", error);
        res.status(500).json({ error: 'Erro ao buscar artistas.' });
    }
};
