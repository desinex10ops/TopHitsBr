const AuthService = require('../services/AuthService');
const UserRepository = require('../repositories/UserRepository');

exports.register = async (req, res, next) => {
    try {
        const { user, token } = await AuthService.register(req.body);

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                artisticName: user.artisticName,
                avatar: user.avatar,
                isSeller: user.isSeller
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.login(email, password);

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
                banner: user.banner,
                isSeller: user.isSeller
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        // req.user comes from authMiddleware
        const user = await UserRepository.findById(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, artisticName, bio, instagram, youtube, tiktok, city, state } = req.body;
        const avatarFile = req.files && req.files['avatar'] ? req.files['avatar'][0] : null;
        const bannerFile = req.files && req.files['banner'] ? req.files['banner'][0] : null;
        const bannerVideoFile = req.files && req.files['bannerVideo'] ? req.files['bannerVideo'][0] : null;

        const fs = require('fs');
        const path = require('path');

        // Logic here is mixed (File System + DB). Ideally FileService handles files.
        // For now, let's just use UserRepository to fetch.
        const user = await UserRepository.findById(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Update fields
        // In a real scenario, use a specific Service method: UserService.updateProfile(userId, data, files)
        if (name) user.name = name;
        if (user.type !== 'listener' && artisticName) user.artisticName = artisticName;
        if (bio !== undefined) user.bio = bio;
        if (instagram !== undefined) user.instagram = instagram;
        if (youtube !== undefined) user.youtube = youtube;
        if (tiktok !== undefined) user.tiktok = tiktok;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;

        // File handling (Legacy logic preserved but cleaner)
        const updateFile = (field, file) => {
            if (user[field] && !user[field].startsWith('http')) {
                const oldPath = path.join(__dirname, '../../storage', user[field]);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { console.error(`Failed to delete old ${field}`, e); }
                }
            }
            user[field] = path.relative(path.join(__dirname, '../../storage'), file.path).replace(/\\/g, '/');
        };

        if (avatarFile) updateFile('avatar', avatarFile);
        if (bannerFile) updateFile('banner', bannerFile);
        if (bannerVideoFile) updateFile('bannerVideo', bannerVideoFile);

        await user.save();

        res.json({ message: 'Perfil atualizado!', user });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        await AuthService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        next(error);
    }
};

exports.updatePreferences = async (req, res, next) => {
    try {
        const preferences = await AuthService.updatePreferences(req.user.id, req.body);
        res.json({ message: 'Preferências atualizadas!', preferences });
    } catch (error) {
        next(error);
    }
};

exports.becomeSeller = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { artisticName } = req.body;

        const user = await UserRepository.findById(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        user.isSeller = true;
        if (artisticName) user.artisticName = artisticName;

        await user.save();

        res.json({ message: 'Agora você é um vendedor!', user: { id: user.id, isSeller: user.isSeller, artisticName: user.artisticName } });
    } catch (error) {
        next(error);
    }
};
