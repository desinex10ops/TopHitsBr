const { Album, Track, User } = require('../database');
const fs = require('fs');
const path = require('path');

exports.getAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await Album.findByPk(id, {
            include: [
                { model: Track },
                { model: User, as: 'Artist', attributes: ['id', 'name', 'artisticName', 'avatar'] }
            ]
        });

        if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });

        const formattedAlbum = {
            ...album.toJSON(),
            year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : '2023'
        };

        res.json(formattedAlbum);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do álbum.' });
    }
};

exports.getFeaturedAlbums = async (req, res) => {
    try {
        const albums = await Album.findAll({
            where: { featured: true },
            include: [
                { model: Track, limit: 1 },
                { model: User, as: 'Artist', attributes: ['artisticName', 'name'] }
            ],
            limit: 10
        });

        const formatted = albums.map(a => ({
            id: a.id,
            title: a.title,
            artist: a.Artist?.artisticName || a.Artist?.name || 'Desconhecido',
            coverUrl: a.cover ? `${process.env.API_URL}/storage/${a.cover}` : null,
            featured: true
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching featured albums:", error);
        res.status(500).json({ error: 'Erro ao buscar álbuns em destaque.' });
    }
};

exports.getArtistAlbums = async (req, res) => {
    try {
        const { id } = req.params; // Artist User ID
        const albums = await Album.findAll({
            where: { UserId: id },
            include: [{ model: Track, attributes: ['id', 'title', 'plays', 'duration', 'coverpath'] }],
            order: [['releaseDate', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(albums);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar álbuns.' });
    }
};

exports.updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, genre, description } = req.body;

        const album = await Album.findByPk(id);
        if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });

        // Verify ownership
        if (album.UserId !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ error: 'Permissão negada.' });
        }

        // Handle Video Upload
        if (req.files && req.files.video) {
            const videoFile = req.files.video[0];
            // Store relative path (e.g., 'music/video.mp4')
            album.video = path.relative(path.join(__dirname, '../../storage'), videoFile.path).replace(/\\/g, '/');
        }

        // Handle Cover Upload
        if (req.files && req.files.cover) {
            const coverFile = req.files.cover[0];
            // Store relative path (e.g., 'covers/image.jpg')
            album.cover = path.relative(path.join(__dirname, '../../storage'), coverFile.path).replace(/\\/g, '/');
        }

        if (title) album.title = title;
        if (genre) album.genre = genre;
        if (description) album.description = description;

        await album.save();

        res.json({ message: 'Álbum atualizado com sucesso.', album });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar álbum.' });
    }
};

exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await Album.findByPk(id);

        if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });
        if (album.UserId !== req.user.id && req.user.type !== 'admin') {
            return res.status(403).json({ error: 'Permissão negada.' });
        }

        // Optional: Delete tracks or just unlink?
        // Usually deleting an album deletes its tracks or moves them to singles?
        // Let's just unlink for safety, or delete if empty.
        // For now, let's just delete the Album record and set Track.AlbumId = null
        await Track.update({ AlbumId: null }, { where: { AlbumId: id } });
        await album.destroy();

        res.json({ message: 'Álbum removido.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover álbum.' });
    }
};
