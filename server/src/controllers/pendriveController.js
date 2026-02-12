const { Track } = require('../database');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

exports.createPenDrive = async (req, res) => {
    try {
        const { trackIds } = req.body;
        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            return res.status(400).json({ error: 'Nenhuma música selecionada.' });
        }

        const tracks = await Track.findAll({ where: { id: trackIds } });
        if (tracks.length === 0) {
            return res.status(404).json({ error: 'Músicas não encontradas.' });
        }

        // Configurar resposta para Download
        res.attachment('pen-drive-atualizado.zip');

        const archive = archiver('zip', {
            zlib: { level: 9 } // Compressão máxima
        });

        archive.on('error', function (err) {
            res.status(500).send({ error: err.message });
        });

        archive.pipe(res);

        const sanitizeParams = (str) => {
            if (!str) return 'Desconhecido';
            return str.replace(/[<>:"/\\|?*]+/g, '').trim();
        };

        for (const track of tracks) {
            const sourcePath = path.join(__dirname, '../../storage', track.filepath);
            if (fs.existsSync(sourcePath)) {
                // Formatar estrutura: Artista/Álbum/Música.mp3
                const safeArtist = sanitizeParams(track.artist);
                const safeAlbum = sanitizeParams(track.album || 'Singles');
                const safeTitle = sanitizeParams(track.title);

                // Caminho dentro do ZIP: Artista/Album/01 - Titulo.mp3 (Simulado)
                // Adicionar Artista no nome do arquivo para garantir unicidade em playlists variadas
                const zipPath = `${safeArtist}/${safeAlbum}/${safeArtist} - ${safeTitle}.mp3`;

                archive.file(sourcePath, { name: zipPath });
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar Pen Drive.' });
    }
};
