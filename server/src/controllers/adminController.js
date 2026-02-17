const { Track, SystemSetting, User, Order, OrderItem, Product } = require('../database');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const ExportService = require('../services/ExportService');

// --- Settings Controller ---

exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findAll();
        // Convert array to object for easier frontend consumption
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar configurações.' });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value, description, type } = req.body;
        console.log(`[AdminSettings] Updating: ${key} = ${value}`);

        // Upsert (Insert or Update)
        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key },
            defaults: { value, description, type }
        });

        if (!created) {
            setting.value = value;
            if (description) setting.description = description;
            await setting.save();
        }

        res.json({ message: 'Configuração atualizada.', setting });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar configuração.' });
    }
};

exports.uploadSettingFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: 'Chave da configuração não informada.' });

        // Determine type based on extension
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const isVideo = videoExtensions.some(ext => req.file.originalname.toLowerCase().endsWith(ext));

        // Multer saves to storage/ (or sub), let's use filename as relative path
        // Multer saves to storage/ (or sub), let's use relative path from storage root
        const storageRoot = path.join(__dirname, '../../storage');
        const filePath = path.relative(storageRoot, req.file.path).replace(/\\/g, '/');

        // Update DB
        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key },
            defaults: { value: filePath, type: isVideo ? 'video' : 'image' }
        });

        if (!created) {
            setting.value = filePath;
            setting.type = isVideo ? 'video' : 'image';
            await setting.save();
        }

        res.json({ message: 'Arquivo atualizado.', value: filePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao fazer upload.' });
    }
};

// --- Stats Controller ---
// Função auxiliar para calcular tamanho de pasta recursivamente
const getDirSize = (dirPath) => {
    let size = 0;
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                size += stats.size;
            }
        }
    }
    return size;
};

exports.getStats = async (req, res) => {
    try {
        const { User, PlayHistory, sequelize } = require('../database');

        const totalTracks = await Track.count();
        const totalPlays = await Track.sum('plays') || 0;
        const totalDownloads = await Track.sum('downloads') || 0;
        const totalUsers = await User.count();

        const distinctArtists = await Track.count({
            col: 'artist',
            distinct: true
        });

        // Disk usage
        const storagePath = path.join(__dirname, '../../storage');
        const storageSizeBytes = getDirSize(storagePath);
        const storageSizeMB = (storageSizeBytes / (1024 * 1024)).toFixed(2);

        // --- TRENDS (Last 7 Days) ---
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        // 1. New Tracks Trend
        const tracksTrend = await Track.findAll({
            attributes: [
                [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: { [Sequelize.Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)) }
            },
            group: [sequelize.fn('date', sequelize.col('createdAt'))],
            raw: true
        });

        // 2. Plays Trend
        const playsTrend = await PlayHistory.findAll({
            attributes: [
                [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('count', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: { [Sequelize.Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)) }
            },
            group: [sequelize.fn('date', sequelize.col('createdAt'))],
            raw: true
        });

        // Format chart data
        const chartData = last7Days.map(date => ({
            date: date.split('-').slice(1).reverse().join('/'), // format DD/MM
            tracks: parseInt(tracksTrend.find(t => t.date === date)?.count || 0),
            plays: parseInt(playsTrend.find(p => p.date === date)?.count || 0)
        }));

        res.json({
            totalTracks,
            totalPlays,
            totalDownloads,
            totalArtists: distinctArtists,
            totalUsers,
            storageUsageMB: storageSizeMB,
            chartData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
    }
};
// --- User Management ---

exports.getUsers = async (req, res) => {
    try {
        const { Wallet } = require('../database');
        const users = await User.findAll({
            include: [{ model: Wallet, attributes: ['balance'] }],
            attributes: ['id', 'name', 'email', 'type', 'active', 'createdAt', 'artisticName']
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
};

exports.toggleBan = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Prevent banning self (optional safety) or admin banning another admin (policy choice)
        // For now, let's just update
        user.active = !user.active;
        await user.save();

        res.json({ message: `Usuário ${user.active ? 'ativado' : 'banido'}.`, active: user.active });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao alterar status do usuário.' });
    }
};

exports.updateUserCredits = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, action } = req.body; // action: 'add' or 'set'

        const { Wallet, CreditTransaction } = require('../database');

        let wallet = await Wallet.findOne({ where: { UserId: id } });
        if (!wallet) {
            // Create if likely missing for some reason
            wallet = await Wallet.create({ UserId: id });
        }

        const oldBalance = wallet.balance;
        let newBalance = oldBalance;

        if (action === 'set') {
            newBalance = parseFloat(amount);
        } else {
            // Add (can be negative for deduction)
            newBalance = oldBalance + parseFloat(amount);
        }

        if (newBalance < 0) newBalance = 0;

        wallet.balance = newBalance;
        await wallet.save();

        // Log transaction (Admin adjustment)
        await CreditTransaction.create({
            WalletId: wallet.id,
            amount: newBalance - oldBalance,
            type: 'adjustment',
            description: 'Ajuste Manual Admin'
        });

        res.json({ message: 'Créditos atualizados.', balance: newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar créditos.' });
    }
};

// --- Notification Management ---

exports.getNotifications = async (req, res) => {
    try {
        const { AdminNotification } = require('../database');
        const notifications = await AdminNotification.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar notificações.' });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { AdminNotification } = require('../database');
        const notification = await AdminNotification.findByPk(id);

        if (!notification) return res.status(404).json({ error: 'Notificação não encontrada.' });

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notificação lida.', notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao marcar como lida.' });
    }
};

exports.markAllNotificationsRead = async (req, res) => {
    try {
        const { AdminNotification } = require('../database');
        await AdminNotification.update({ isRead: true }, { where: { isRead: false } });
        res.json({ message: 'Todas as notificações marcadas como lidas.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao marcar todas como lidas.' });
    }
};

// --- Export CSV Handlers ---

exports.exportUsersCSV = async (req, res) => {
    try {
        const users = await User.findAll({ raw: true });
        const fields = [
            { label: 'ID', key: 'id' },
            { label: 'Nome', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Tipo', key: 'type' },
            { label: 'Status', key: 'active' },
            { label: 'Data Cadastro', key: 'createdAt' }
        ];
        const csv = ExportService.toCSV(users, fields);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=thbr_users.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao exportar usuários.' });
    }
};

exports.exportSalesCSV = async (req, res) => {
    try {
        const sales = await OrderItem.findAll({
            include: [
                { model: Product, attributes: ['title', 'price'] },
                { model: Order, include: [{ model: User, as: 'Buyer', attributes: ['name', 'email'] }] }
            ]
        });

        // Flatten data for CSV
        const flatSales = sales.map(item => ({
            id: item.id,
            product: item.Product?.title,
            price: item.Product?.price,
            buyer: item.Order?.Buyer?.name,
            buyerEmail: item.Order?.Buyer?.email,
            date: item.createdAt,
            status: item.Order?.status
        }));

        const fields = [
            { label: 'ID Venda', key: 'id' },
            { label: 'Produto', key: 'product' },
            { label: 'Preço', key: 'price' },
            { label: 'Comprador', key: 'buyer' },
            { label: 'Email Comprador', key: 'buyerEmail' },
            { label: 'Data', key: 'date' },
            { label: 'Status Pedido', key: 'status' }
        ];

        const csv = ExportService.toCSV(flatSales, fields);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=thbr_sales.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao exportar vendas.' });
    }
};

// --- Content Moderation ---

exports.getTracks = async (req, res) => {
    try {
        const { Track, User } = require('../database');
        const tracks = await Track.findAll({
            include: [{ model: User, as: 'Artist', attributes: ['name', 'artisticName'] }],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        const formatted = tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.Artist?.artisticName || t.artistName || 'Desconhecido',
            coverUrl: t.coverpath ? `${process.env.API_URL}/storage/${t.coverpath}` : null,
            featured: t.featured,
            plays: t.plays
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching admin tracks:', error);
        res.status(500).json({ error: 'Erro ao buscar músicas.' });
    }
};

exports.getAlbums = async (req, res) => {
    try {
        const { Album, User } = require('../database');
        const albums = await Album.findAll({
            include: [{ model: User, as: 'Artist', attributes: ['name', 'artisticName'] }],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        const formatted = albums.map(a => ({
            id: a.id,
            title: a.title,
            artist: a.Artist?.artisticName || a.artistName || 'Desconhecido',
            coverUrl: a.cover ? `${process.env.API_URL}/storage/${a.cover}` : null,
            featured: a.featured
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching admin albums:', error);
        res.status(500).json({ error: 'Erro ao buscar álbuns.' });
    }
};

exports.deleteTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const { Track } = require('../database');
        const track = await Track.findByPk(id);
        if (!track) return res.status(404).json({ error: 'Música não encontrada.' });

        await track.destroy();
        res.json({ message: 'Música excluída com sucesso.' });
    } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ error: 'Erro ao excluir música.' });
    }
};

exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { Album } = require('../database');
        const album = await Album.findByPk(id);
        if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });

        await album.destroy();
        res.json({ message: 'Álbum excluído com sucesso.' });
    } catch (error) {
        console.error('Error deleting album:', error);
        res.status(500).json({ error: 'Erro ao excluir álbum.' });
    }
};

exports.toggleTrackFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const { Track } = require('../database');
        const track = await Track.findByPk(id);
        if (!track) return res.status(404).json({ error: 'Música não encontrada.' });

        track.featured = !track.featured;
        await track.save();

        res.json({ featured: track.featured });
    } catch (error) {
        console.error('Error toggling track feature:', error);
        res.status(500).json({ error: 'Erro ao destacar música.' });
    }
};

exports.toggleAlbumFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const { Album } = require('../database');
        const album = await Album.findByPk(id);
        if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });

        album.featured = !album.featured;
        await album.save();

        res.json({ featured: album.featured });
    } catch (error) {
        console.error('Error toggling album feature:', error);
        res.status(500).json({ error: 'Erro ao destacar álbum.' });
    }
};
