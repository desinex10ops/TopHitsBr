const MusicRepository = require('../repositories/MusicRepository');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class MusicService {
    constructor() {
        this.storagePath = path.join(__dirname, '../../storage');
    }

    async uploadTrack(userId, data, files) {
        const { title, artist, album, genre, vibe, hasKaraoke, lyrics } = data;
        const audioFile = files['audio'] ? files['audio'][0] : null;
        const coverFile = files['cover'] ? files['cover'][0] : null;
        const karaokeFile = files['karaoke'] ? files['karaoke'][0] : null;

        if (!audioFile || !title || !artist) {
            throw new AppError('Áudio, Título e Artista são obrigatórios.', 400);
        }

        const coverPath = coverFile ? path.relative(this.storagePath, coverFile.path).replace(/\\/g, '/') : null;
        const audioPath = path.relative(this.storagePath, audioFile.path).replace(/\\/g, '/');
        const karaokePath = karaokeFile ? path.relative(this.storagePath, karaokeFile.path).replace(/\\/g, '/') : null;

        // Find or Create Album
        const [albumObj] = await MusicRepository.findOrCreateAlbum(
            { title: album || 'Singles', UserId: userId },
            {
                genre: genre || 'Outro',
                cover: coverPath,
                description: `Álbum de Single: ${title}`
            }
        );

        const track = await MusicRepository.createTrack({
            title,
            artist,
            album: albumObj.title,
            genre,
            vibe,
            filepath: audioPath,
            coverpath: coverPath,
            duration: 0,
            UserId: userId,
            AlbumId: albumObj.id,
            hasKaraoke: hasKaraoke === 'true',
            karaokeFile: karaokePath,
            lyrics: lyrics || null
        });

        return track;
    }

    async getAllTracks(query) {
        const { search, artist, album } = query;
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

        const tracks = await MusicRepository.findAllTracks({
            where,
            order: [['createdAt', 'ASC']]
        });
        console.log(`[MusicService] Found ${tracks.length} tracks for query:`, query);
        return tracks;
    }


    async deleteTrack(id) {
        const track = await MusicRepository.findTrackById(id);
        if (!track) throw new AppError('Música não encontrada.', 404);

        // Delete files
        this.deleteFile(track.filepath);
        if (track.coverpath) this.deleteFile(track.coverpath);
        if (track.karaokeFile) this.deleteFile(track.karaokeFile);

        await MusicRepository.deleteTrack(track);
    }

    deleteFile(relativePath) {
        const fullPath = path.join(this.storagePath, relativePath);
        if (fs.existsSync(fullPath)) {
            try { fs.unlinkSync(fullPath); } catch (e) {
                console.error(`Failed to delete file ${fullPath}`, e);
            }
        }
    }

    async getMyTracks(userId) {
        return await MusicRepository.findTracksByUser(userId);
    }

    async getGenres() {
        return await MusicRepository.getDistinctGenres();
    }

    async getTracksByGenre(genre) {
        return await MusicRepository.findTracksByGenre(genre);
    }

    async updateTrack(id, data, coverFile) {
        const track = await MusicRepository.findTrackById(id);
        if (!track) throw new AppError('Música não encontrada.', 404);

        const { title, artist, album, genre, vibe } = data;

        if (title) track.title = title;
        if (artist) track.artist = artist;
        if (album) track.album = album;
        if (genre) track.genre = genre;
        if (vibe) track.vibe = vibe;

        if (coverFile) {
            if (track.coverpath) this.deleteFile(track.coverpath);
            track.coverpath = path.relative(this.storagePath, coverFile.path).replace(/\\/g, '/');
        }

        await track.save();
        return track;
    }

    async updateKaraoke(id, lyrics, karaokeFile) {
        const track = await MusicRepository.findTrackById(id);
        if (!track) throw new AppError('Música não encontrada.', 404);

        if (lyrics !== undefined) {
            track.lyrics = lyrics;
        }

        if (karaokeFile) {
            if (track.karaokeFile) this.deleteFile(track.karaokeFile);
            track.karaokeFile = path.relative(this.storagePath, karaokeFile.path).replace(/\\/g, '/');
        }

        if (track.lyrics || track.karaokeFile) {
            track.hasKaraoke = true;
        }

        await track.save();
        return track;
    }
}

module.exports = new MusicService();
