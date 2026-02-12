const { Comment, Track, User, Playlist } = require('../database');

module.exports = {
    // Adicionar Comentário
    async addComment(req, res) {
        try {
            const { trackId, playlistId, content } = req.body;
            const userId = req.user.id;

            if (!content) return res.status(400).json({ error: 'Conteúdo obrigatório.' });
            if (!trackId && !playlistId) return res.status(400).json({ error: 'Target obrigatório (Track ou Playlist).' });

            const comment = await Comment.create({
                content,
                UserId: userId,
                TrackId: trackId || null,
                PlaylistId: playlistId || null
            });

            // Retornar comentário com dados do usuário para atualização imediata no front
            const fullComment = await Comment.findOne({
                where: { id: comment.id },
                include: [{ model: User, attributes: ['name', 'avatar'] }]
            });

            res.json(fullComment);
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            res.status(500).json({ error: 'Erro interno ao adicionar comentário.' });
        }
    },

    // Listar Comentários de uma Playlist
    async getPlaylistComments(req, res) {
        try {
            const { playlistId } = req.params;
            const comments = await Comment.findAll({
                where: { PlaylistId: playlistId },
                include: [{ model: User, attributes: ['name', 'avatar', 'id'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(comments);
        } catch (error) {
            console.error('Erro ao buscar comentários da playlist:', error);
            res.status(500).json({ error: 'Erro ao buscar comentários.' });
        }
    },

    // Listar Comentários de uma Música
    async getTrackComments(req, res) {
        try {
            const { trackId } = req.params;
            const comments = await Comment.findAll({
                where: { TrackId: trackId },
                include: [{ model: User, attributes: ['name', 'avatar', 'id'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(comments);
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            res.status(500).json({ error: 'Erro ao buscar comentários.' });
        }
    },

    // Listar Comentários do Usuário (Dashboard)
    async getUserComments(req, res) {
        try {
            const userId = req.user.id;
            const comments = await Comment.findAll({
                where: { UserId: userId },
                include: [
                    { model: Track, attributes: ['title', 'id', 'coverpath'] },
                    { model: Playlist, attributes: ['name', 'id', 'cover'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(comments);
        } catch (error) {
            console.error('Erro ao buscar comentários do usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar comentários.' });
        }
    },

    // Deletar Comentário
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const comment = await Comment.findOne({ where: { id } });

            if (!comment) return res.status(404).json({ error: 'Comentário não encontrado.' });

            // Apenas o dono pode deletar (ou admin, futuramente)
            if (comment.UserId !== userId) {
                return res.status(403).json({ error: 'Sem permissão.' });
            }

            await comment.destroy();
            res.json({ success: true });
        } catch (error) {
            console.error('Erro ao deletar comentário:', error);
            res.status(500).json({ error: 'Erro ao deletar comentário.' });
        }
    }
};
