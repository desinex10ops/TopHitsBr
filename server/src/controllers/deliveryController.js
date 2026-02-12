const { DownloadLink, DownloadLog, Product, Order, User } = require('../database');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');

// Config path to storage
const STORAGE_PATH = path.join(__dirname, '../../storage');

const deliveryController = {
    // 1. Generate Secure Link (Called when user clicks "Download" in MyPurchases)
    generateLink: async (req, res) => {
        try {
            const { productId, orderId } = req.body;
            const userId = req.user.id;
            const ip = req.ip || req.connection.remoteAddress;

            // Verify ownership
            const order = await Order.findOne({
                where: { id: orderId, buyerId: userId, status: 'completed' }
            });

            if (!order) {
                return res.status(403).json({ error: 'Compra não encontrada ou não finalizada.' });
            }

            // Create Token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24h validity

            const link = await DownloadLink.create({
                token,
                UserId: userId,
                ProductId: productId,
                OrderId: orderId,
                expiresAt,
                lockedIp: ip, // Lock to this IP
                maxDownloads: 5
            });

            // Return the secure URL
            const downloadUrl = `/api/delivery/download/${token}`;
            res.json({ downloadUrl, expiresAt });

        } catch (error) {
            console.error("Error generating link:", error);
            res.status(500).json({ error: 'Erro ao gerar link seguro.' });
        }
    },

    // 2. Handle Download & Watermarking
    downloadFile: async (req, res) => {
        const { token } = req.params;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        try {
            const link = await DownloadLink.findOne({
                where: { token },
                include: [{ model: User }, { model: Product }, { model: Order }]
            });

            // Validation Checks
            if (!link) {
                await logAttempt(null, ip, userAgent, 'failed', 'Token Inexistente');
                return res.status(404).send('Link inválido.');
            }

            if (!link.isActive) {
                await logAttempt(link.id, ip, userAgent, 'expired', 'Link Inativo');
                return res.status(410).send('Link expirado.');
            }

            if (new Date() > link.expiresAt) {
                await logAttempt(link.id, ip, userAgent, 'expired', 'Link Expirado');
                return res.status(410).send('Link expirado.');
            }

            if (link.downloadCount >= link.maxDownloads) {
                await logAttempt(link.id, ip, userAgent, 'blocked', 'Limite de Downloads Excedido');
                return res.status(403).send('Limite de downloads excedido.');
            }

            // IP Lock Check
            // if (link.lockedIp && link.lockedIp !== ip) {
            //     // Optional: Disable for now to avoid issues with dynamic IPs or proxies
            //     // await logAttempt(link.id, ip, userAgent, 'blocked', 'IP Bloqueado');
            //     // return res.status(403).send('Download bloqueado para este IP.');
            // }

            // Locate File
            const filePath = path.join(STORAGE_PATH, link.Product.file);
            if (!fs.existsSync(filePath)) {
                return res.status(500).send('Arquivo original não encontrado no servidor.');
            }

            // Increment Count
            await link.increment('downloadCount');
            await logAttempt(link.id, ip, userAgent, 'success', 'Download Iniciado');

            // --- WATERMARKING (METADATA INJECTION) ---
            // Instead of modifying audio stream (slow), we use FFmpeg to copy stream and add metadata
            // Outputs to a temp stream

            const fileName = `TopHitsBR_${link.Product.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;

            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'audio/mpeg');

            // Metadata to inject
            const metadata = {
                title: link.Product.title,
                artist: link.Product.Producer.name || 'TopHitsBR Artist',
                album: 'TopHitsBR Exclusive',
                comment: `License: ${link.User.name} (CPF/ID: ${link.User.id}) - Transaction: ${link.Order.id}`,
                copyright: `Licensed to ${link.User.name} via TopHitsBR`,
                encoded_by: 'TopHitsBR Anti-Piracy System'
            };

            // Process with FFmpeg
            ffmpeg(filePath)
                .outputOptions('-map_metadata', '0') // Keep original metadata
                .outputOptions('-metadata', `title=${metadata.title}`)
                .outputOptions('-metadata', `artist=${metadata.artist}`)
                .outputOptions('-metadata', `album=${metadata.album}`)
                .outputOptions('-metadata', `comment=${metadata.comment}`)
                .outputOptions('-metadata', `copyright=${metadata.copyright}`)
                .outputOptions('-metadata', `encoded_by=${metadata.encoded_by}`)
                .format('mp3')
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    // Fallback to sending original file if FFmpeg fails
                    if (!res.headersSent) {
                        res.download(filePath, fileName);
                    }
                })
                .pipe(res, { end: true });

        } catch (error) {
            console.error("Download Error:", error);
            res.status(500).send('Erro interno no servidor.');
        }
    }
};

async function logAttempt(linkId, ip, userAgent, status, reason) {
    try {
        await DownloadLog.create({
            DownloadLinkId: linkId,
            ipAddress: ip,
            userAgent: userAgent && userAgent.substring(0, 255),
            status,
            reason
        });
    } catch (e) {
        console.error("Log Error:", e);
    }
}

// Admin: Get Logs
deliveryController.retrieveLogs = async (req, res) => {
    try {
        // Simple pagination
        const limit = 50;
        const page = req.query.page || 1;
        const offset = (page - 1) * limit;

        const logs = await DownloadLog.findAndCountAll({
            include: [
                {
                    model: DownloadLink,
                    include: [{ model: Product, attributes: ['title'] }]
                },
                { model: User, attributes: ['name', 'email', 'id'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json(logs);
    } catch (error) {
        console.error("Erro ao buscar logs:", error);
        res.status(500).json({ error: 'Erro ao buscar logs.' });
    }
};

module.exports = deliveryController;
