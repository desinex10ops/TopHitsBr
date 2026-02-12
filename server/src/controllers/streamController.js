const { Track, PlayHistory } = require('../database');
const path = require('path');
const fs = require('fs');

exports.streamTrack = async (req, res) => {
    try {
        const trackId = req.params.id;
        const track = await Track.findByPk(trackId);

        if (!track) {
            return res.status(404).json({ error: 'Música não encontrada.' });
        }

        // Log Play History (Fire-and-forget)
        // Tentamos pegar o IP do x-forwarded-for (proxy) ou socket
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        // Se tiver usuario logado (futuro, via middleware opcional), poderiamos salvar req.user.id
        // Por enquanto, salvamos anonimo ou se vier no request

        PlayHistory.create({
            TrackId: track.id,
            ip: ip,
            userAgent: userAgent
        }).catch(err => console.error("Erro ao registrar PlayHistory:", err));

        const musicPath = path.join(__dirname, '../../storage', track.filepath);
        console.log(`[Stream] Request ID: ${trackId}`);
        console.log(`[Stream] Path no banco: ${track.filepath}`);
        console.log(`[Stream] Full path: ${musicPath}`);

        if (!fs.existsSync(musicPath)) {
            console.error(`[Stream] ARQUIVO NÃO ENCONTRADO: ${musicPath}`);
            return res.status(404).json({ error: 'Arquivo de áudio não encontrado no servidor.' });
        }

        // Usar res.sendFile do Express que já trata Ranges e Headers automaticamente
        res.sendFile(musicPath, (err) => {
            if (err) {
                console.error(`[Stream] Erro no sendFile:`, err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Erro ao enviar arquivo.' });
                }
            } else {
                // Incrementa plays apenas se sucesso
                track.increment('plays').catch(e => console.error("Erro incrementar play:", e));
            }
        });

        // Incrementa contador de plays de forma assíncrona (não bloqueante)
        track.increment('plays');

    } catch (error) {
        console.error(error);
        // Se o header já foi enviado, não podemos enviar json
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro no streaming.' });
        }
    }
};
