const { Track, SystemSetting, Album } = require('../database');
const path = require('path');
const fs = require('fs');
// const ffmpeg = require('fluent-ffmpeg'); // Futuro: extrair duração real

exports.uploadTrack = async (req, res) => {
    try {
        const { title, artist, album, genre, vibe } = req.body;
        const audioFile = req.files['audio'] ? req.files['audio'][0] : null;
        const coverFile = req.files['cover'] ? req.files['cover'][0] : null;
        const karaokeFile = req.files['karaoke'] ? req.files['karaoke'][0] : null;
        const userId = req.user.id; // Vem do Auth Middleware

        if (!audioFile || !title || !artist) {
            return res.status(400).json({ error: 'Áudio, Título e Artista são obrigatórios.' });
        }

        const coverPath = coverFile ? path.relative(path.join(__dirname, '../../storage'), coverFile.path).replace(/\\/g, '/') : null;

        // [FIX] Find or Create Album (Ensure track belongs to an album)
        const [albumObj, created] = await Album.findOrCreate({
            where: {
                title: album || 'Singles',
                UserId: userId
            },
            defaults: {
                genre: genre || 'Outro',
                cover: coverPath,
                artist: artist || 'Desconhecido', // Add artist field if missing in Album model defaults? No, Album has no artist field in definition? Wait.
                // Album model definition: title, genre, cover, description, UserId. 
                // It does NOT have 'artist' column explicitly defined in `database.js` above? 
                // Let's check database.js Album definition. 
                // It allows ad-hoc? No. User.hasMany(Album). 
                // We should put description or title.
                description: `Álbum de Single: ${title}`
            }
        });

        // Criar registro no banco
        const track = await Track.create({
            title,
            artist,
            album: albumObj.title, // Use consistency
            genre,
            vibe,
            filepath: path.relative(path.join(__dirname, '../../storage'), audioFile.path).replace(/\\/g, '/'),
            coverpath: coverPath,
            duration: 0,
            UserId: userId, // Associar ao usuário
            AlbumId: albumObj.id, // [FIX] Link to Album
            // Karaokê (Opcional no upload inicial, mas preparado)
            hasKaraoke: req.body.hasKaraoke === 'true',
            karaokeFile: req.files['karaoke'] ? path.relative(path.join(__dirname, '../../storage'), req.files['karaoke'][0].path).replace(/\\/g, '/') : null,
            lyrics: req.body.lyrics || null
        });

        res.status(201).json(track);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar upload.' });
    }
};

exports.getMyTracks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tracks = await Track.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(tracks);
    } catch (error) {
        console.error("Erro getMyTracks:", error);
        res.status(500).json({ error: 'Erro ao buscar suas músicas.' });
    }
};

const { Op, Sequelize } = require('sequelize');

exports.getAllTracks = async (req, res) => {
    try {
        const { search, artist, album } = req.query;
        let where = {};

        if (search) {
            where = {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { artist: { [Op.like]: `%${search}%` } },
                    { album: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (artist) where.artist = artist;
        if (album) where.album = album;

        const tracks = await Track.findAll({
            where,
            order: [['createdAt', 'ASC']]
        });
        res.json(tracks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar músicas.' });
    }
};

exports.getGenres = async (req, res) => {
    try {
        const genres = await Track.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('genre')), 'genre']],
            where: {
                genre: { [Op.ne]: null } // Ignorar nulos
            },
            order: [['genre', 'ASC']],
            raw: true
        });
        // Retornar array simples de strings
        const genreList = genres.map(g => g.genre).filter(g => g);
        res.json(genreList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar gêneros.' });
    }
};

exports.getTracksByGenre = async (req, res) => {
    try {
        const { genre } = req.params;
        const tracks = await Track.findAll({
            where: { genre },
            order: [['createdAt', 'DESC']]
        });
        res.json(tracks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar músicas por gênero.' });
    }
};

exports.deleteTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const track = await Track.findByPk(id);

        if (!track) {
            return res.status(404).json({ error: 'Música não encontrada.' });
        }

        // Remover arquivos físicos
        const audioPath = path.join(__dirname, '../../storage', track.filepath);
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }

        if (track.coverpath) {
            const coverPath = path.join(__dirname, '../../storage', track.coverpath);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
        }

        // Remover do banco
        await track.destroy();

        res.json({ message: 'Música excluída com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir música.' });
    }
};
exports.updateTrackKaraoke = async (req, res) => {
    try {
        const { id } = req.params;
        const { lyrics } = req.body;
        console.log(`[Karaoke Update] Track ID: ${id}`);
        console.log(`[Karaoke Update] Lyrics received: ${lyrics ? 'Yes' : 'No'}`);

        // Handle req.files being undefined
        const files = req.files || {};
        const karaokeFile = files['karaoke'] ? files['karaoke'][0] : null;

        console.log(`[Karaoke Update] File received: ${karaokeFile ? karaokeFile.originalname : 'No'}`);

        const track = await Track.findByPk(id);
        if (!track) {
            return res.status(404).json({ error: 'Música não encontrada.' });
        }

        // Update Lyrics
        if (lyrics !== undefined) {
            track.lyrics = lyrics;
        }

        // Update Karaoke File
        if (karaokeFile) {
            // Delete old file if exists
            if (track.karaokeFile) {
                const oldPath = path.join(__dirname, '../../storage', track.karaokeFile);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { }
                }
            }
            track.karaokeFile = path.relative(path.join(__dirname, '../../storage'), karaokeFile.path).replace(/\\/g, '/');
        }

        // Auto-enable karaoke if assets are present
        if (track.lyrics || track.karaokeFile) {
            track.hasKaraoke = true;
        }

        await track.save();
        console.log('[Karaoke Update] Success!');
        res.json({ message: 'Karaokê atualizado.', track });

    } catch (error) {
        console.error('[Karaoke Update Error]:', error);
        res.status(500).json({ error: 'Erro ao atualizar Karaokê: ' + error.message });
    }
};
