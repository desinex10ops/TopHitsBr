const { Track, SystemSetting } = require('../database');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

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
        const totalTracks = await Track.count();
        const totalPlays = await Track.sum('plays') || 0;
        const totalDownloads = await Track.sum('downloads') || 0;

        // Contagem distinta (aproximada para SQLite)
        const distinctArtists = await Track.count({
            col: 'artist',
            distinct: true
        });

        // Calcular uso de disco
        const storagePath = path.join(__dirname, '../../storage');
        const storageSizeBytes = getDirSize(storagePath);
        const storageSizeMB = (storageSizeBytes / (1024 * 1024)).toFixed(2);

        res.json({
            totalTracks,
            totalPlays,
            totalDownloads,
            totalArtists: distinctArtists,
            storageUsageMB: storageSizeMB
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
