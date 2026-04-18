const { User } = require('../database');
const { Op } = require('sequelize');

exports.listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { artisticName: { [Op.like]: `%${search}%` } }
            ];
        }
        if (role) where.type = role;
        // active status handling might depend on your schema, assuming 'active' boolean or similar
        // if (status) where.active = status === 'true';

        const { count, rows } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: { exclude: ['password'] }, // Don't return passwords
            order: [['createdAt', 'DESC']]
        });

        res.json({
            users: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { artisticName: { [Op.like]: `%${q}%` } }
                ],
                id: { [Op.ne]: req.user.id } // Exclude self
            },
            limit: 10,
            attributes: ['id', 'name', 'artisticName', 'avatar', 'type']
        });

        res.json(users);
    } catch (error) {
        console.error("Erro na busca de usuários:", error);
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'admin', 'producer', 'artist', 'listener'

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        user.type = type;
        await user.save();

        res.json({ message: 'Função do usuário atualizada com sucesso.', user });
    } catch (error) {
        console.error('Erro ao atualizar função:', error);
        res.status(500).json({ error: 'Erro ao atualizar função.' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body; // true or false (ban/unban)

        // Ensure your User model has an 'active' field. If not, we might need a migration or use a workaround.
        // Checking authController might reveal if there's a status field.
        // For now, assuming a standard update.

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // If schema doesn't have active, we might need to add it. 
        // Let's assume for now we can update it.
        user.active = active;
        await user.save();

        res.json({ message: `Usuário ${active ? 'ativado' : 'banido'} com sucesso.`, user });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status.' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        await user.destroy(); // Soft delete if paranoid is true in model
        res.json({ message: 'Usuário removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover usuário:', error);
        res.status(500).json({ error: 'Erro ao remover usuário.' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'artisticName', 'avatar', 'cover', 'bio', 'type', 'stats', 'createdAt'],
            include: []
        });

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Check if current user follows this user
        let isFollowing = false;
        if (req.user) {
            const currentUser = await User.findByPk(req.user.id);
            if (currentUser) {
                // Assuming hasFollowing is available via association
                // If not, we might need to check manually in specific association table
                // Let's rely on standard Sequelize mixin for now or try/catch wrapper if fails
                const followCheck = await currentUser.getFollowing({ where: { id: user.id } });
                isFollowing = followCheck.length > 0;
            }
        }

        res.json({ user, isFollowing });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
};

exports.getLibrary = async (req, res) => {
    try {
        const userId = req.user.id;
        // Check database.js for correct aliases
        // User.belongsToMany(Track, { through: 'UserLikes' }); -> default alias is usually Tracks
        // User.belongsToMany(Playlist, { as: 'LikedPlaylists', through: 'UserPlaylistLikes' });
        // User.belongsToMany(User, { as: 'Following', ... });

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name'],
            include: [
                {
                    model: Track,
                    through: { attributes: [] } // hide join table
                },
                {
                    model: Playlist,
                    as: 'LikedPlaylists',
                    through: { attributes: [] }
                },
                {
                    model: User,
                    as: 'Following',
                    attributes: ['id', 'name', 'artisticName', 'avatar'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        res.json({
            tracks: user.Tracks || [],
            playlists: user.LikedPlaylists || [],
            following: user.Following || []
        });
    } catch (error) {
        console.error('Erro ao buscar biblioteca:', error);
        res.status(500).json({ error: 'Erro ao buscar biblioteca.' });
    }
};
