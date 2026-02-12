const { User } = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tophitsbr_secret_key_123'; // Em prod usar .env

exports.register = async (req, res) => {
    try {
        const { name, email, password, type, artisticName } = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado.' });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar usuário
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            type: type || 'listener',
            artisticName: type === 'artist' || type === 'admin' ? artisticName : null
        });

        // Gerar Token
        const token = jwt.sign({ id: newUser.id, type: newUser.type }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                type: newUser.type,
                artisticName: newUser.artisticName,
                avatar: newUser.avatar
            }
        });

    } catch (error) {
        console.error('Erro no Registro:', error);
        res.status(500).json({ error: 'Erro ao criar conta.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        // Gerar Token
        const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                artisticName: user.artisticName,
                avatar: user.avatar,
                banner: user.banner
            }
        });

    } catch (error) {
        console.error('Erro no Login:', error);
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user vem do middleware
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erro getMe:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, artisticName, bio, instagram, youtube, tiktok, city, state } = req.body;
        const avatarFile = req.files && req.files['avatar'] ? req.files['avatar'][0] : null;
        const bannerFile = req.files && req.files['banner'] ? req.files['banner'][0] : null;
        const bannerVideoFile = req.files && req.files['bannerVideo'] ? req.files['bannerVideo'][0] : null;

        const fs = require('fs');
        const path = require('path');

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Atualizar campos de texto
        if (name) user.name = name;
        if (user.type !== 'listener' && artisticName) user.artisticName = artisticName;
        if (bio !== undefined) user.bio = bio;
        if (instagram !== undefined) user.instagram = instagram;
        if (youtube !== undefined) user.youtube = youtube;
        if (tiktok !== undefined) user.tiktok = tiktok;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;

        // Atualizar Avatar
        if (avatarFile) {
            // Deletar antigo se existir e não for externo
            if (user.avatar && !user.avatar.startsWith('http')) {
                const oldPath = path.join(__dirname, '../../storage', user.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            user.avatar = path.relative(path.join(__dirname, '../../storage'), avatarFile.path).replace(/\\/g, '/');
        }

        // Atualizar Banner
        if (bannerFile) {
            // Deletar antigo se existir e não for externo
            if (user.banner && !user.banner.startsWith('http')) {
                const oldPath = path.join(__dirname, '../../storage', user.banner);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            user.banner = path.relative(path.join(__dirname, '../../storage'), bannerFile.path).replace(/\\/g, '/');
        }

        // Atualizar Banner Video
        if (bannerVideoFile) {
            if (user.bannerVideo && !user.bannerVideo.startsWith('http')) {
                const oldPath = path.join(__dirname, '../../storage', user.bannerVideo);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            user.bannerVideo = path.relative(path.join(__dirname, '../../storage'), bannerVideoFile.path).replace(/\\/g, '/');
        }

        await user.save();

        res.json({ message: 'Perfil atualizado!', user });

    } catch (error) {
        console.error('Erro updateProfile:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil: ' + error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Verificar senha atual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Senha atual incorreta.' });
        }

        // Hash nova senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('Erro ao mudar senha:', error);
        res.status(500).json({ error: 'Erro ao mudar senha.' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notifications, darkMode } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        user.preferences = { notifications, darkMode };
        await user.save();

        res.json({ message: 'Preferências atualizadas!', preferences: user.preferences });
    } catch (error) {
        console.error('Erro ao atualizar preferências:', error);
        res.status(500).json({ error: 'Erro ao atualizar preferências.' });
    }
};
