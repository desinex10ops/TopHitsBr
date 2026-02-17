const { Track, sequelize } = require('../database');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

exports.createPenDrive = async (req, res) => {
    try {
        const { trackIds, structure = 'artist_album', convertTo = 'original' } = req.body;
        const userId = req.user.id;

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            return res.status(400).json({ error: 'Nenhuma música selecionada.' });
        }

        const tracks = await Track.findAll({ where: { id: trackIds } });
        if (tracks.length === 0) {
            return res.status(404).json({ error: 'Músicas não encontradas.' });
        }

        // Log export history (async)
        // Check if ExportHistory is defined in database.js scope or model
        // Assuming we need to require it or it's global? Better to require from database.
        const { ExportHistory } = require('../database');
        try {
            const historyEntries = trackIds.map(tid => ({ userId, trackId: tid }));
            await ExportHistory.bulkCreate(historyEntries);
        } catch (e) {
            console.error("Failed to log export history", e);
        }

        // Configurar resposta para Download
        res.attachment('pen-drive-atualizado.zip');

        const archive = archiver('zip', {
            zlib: { level: 9 } // Compressão máxima
        });

        archive.on('error', function (err) {
            if (!res.headersSent) res.status(500).send({ error: err.message });
        });

        archive.pipe(res);

        const sanitizeParams = (str) => {
            if (!str) return 'Desconhecido';
            return str.replace(/[<>:"/\\|?*]+/g, '').trim();
        };

        for (const track of tracks) {
            const sourcePath = path.join(__dirname, '../../storage', track.filepath);
            if (fs.existsSync(sourcePath)) {

                let zipPath = '';
                const safeArtist = sanitizeParams(track.artist);
                const safeTitle = sanitizeParams(track.title);
                const safeAlbum = sanitizeParams(track.album || 'Singles');
                const safeGenre = sanitizeParams(track.genre || 'Outros');

                // Folder Structure Logic
                switch (structure) {
                    case 'genre':
                        zipPath = `${safeGenre}/${safeArtist}/${safeArtist} - ${safeTitle}.mp3`;
                        break;
                    case 'root':
                        zipPath = `${safeArtist} - ${safeTitle}.mp3`;
                        break;
                    case 'playlist':
                        // If we had playlist context, we could use it here. 
                        // For now, fall back to artist/album or similar.
                        zipPath = `Músicas/${safeArtist} - ${safeTitle}.mp3`;
                        break;
                    case 'artist_album':
                    default:
                        zipPath = `${safeArtist}/${safeAlbum}/${safeArtist} - ${safeTitle}.mp3`;
                        break;
                }

                // TODO: Implement Conversion Logic here if 'convertTo' is 'mp3_128' using ffmpeg
                // For now, direct copy
                archive.file(sourcePath, { name: zipPath });
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar Pen Drive.' });
    }
};

exports.getSmartFill = async (req, res) => {
    try {
        const { limitBytes, limitCount, strategy = 'top_played', vibe } = req.query;
        // limitBytes in MB, convert to bytes
        const maxBytes = limitBytes ? parseInt(limitBytes) * 1024 * 1024 : 500 * 1024 * 1024; // Default 500MB if not specified
        const maxCount = limitCount ? parseInt(limitCount) : 100;

        let order = [['plays', 'DESC']];
        let where = {};

        if (strategy === 'random') {
            order = [sequelize.random()];
        } else if (strategy === 'recent') {
            order = [['createdAt', 'DESC']];
        } else if (strategy === 'vibe' && vibe) {
            where.vibe = { [require('sequelize').Op.like]: `%${vibe}%` };
            order = [sequelize.random()]; // Randomize within vibe
        }

        const allTracks = await Track.findAll({
            where,
            limit: 500, // Fetch a pool to select from
            order,
            attributes: ['id', 'title', 'artist', 'album', 'filepath', 'duration', 'plays', 'vibe']
        });

        const selectedTracks = [];
        let currentBytes = 0;
        let currentCount = 0;

        for (const track of allTracks) {
            // Estimate size: 320kbps = 40KB/s (approx 1MB/min for 128k, but let's be safe with 40KB/s)
            const estimatedSize = (track.duration || 180) * 40 * 1024;

            if (maxBytes && (currentBytes + estimatedSize) > maxBytes) continue;
            if (maxCount && currentCount >= maxCount) break;

            // Avoid duplicates if array already has it (though DB query shouldn't return dupes)
            if (selectedTracks.find(t => t.id === track.id)) continue;

            selectedTracks.push(track);
            currentBytes += estimatedSize;
            currentCount++;
        }

        res.json({
            tracks: selectedTracks,
            totalSize: currentBytes,
            totalCount: currentCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar Smart Fill.' });
    }
};
