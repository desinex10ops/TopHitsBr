const { Comment, Track, User, Playlist, Album } = require('../database');
const NotificationService = require('../services/NotificationService');

module.exports = {
    // Adicionar Comentário
    async addComment(req, res) {
        try {
            const { trackId, playlistId, albumId, content } = req.body;
            const userId = req.user.id;

            if (!content) return res.status(400).json({ error: 'Conteúdo obrigatório.' });
            if (!trackId && !playlistId && !albumId) return res.status(400).json({ error: 'Target obrigatório.' });

            const comment = await Comment.create({
                content,
                UserId: userId,
                TrackId: trackId || null,
                PlaylistId: playlistId || null,
                AlbumId: albumId || null
            });

            // Find target owner to notify
            let recipientId = null;
            let targetTitle = '';

            if (trackId) {
                const track = await Track.findByPk(trackId);
                if (track) {
                    recipientId = track.UserId;
                    targetTitle = `sua música "${track.title}"`;
                }
            } else if (albumId) {
                const album = await Album.findByPk(albumId);
                if (album) {
                    recipientId = album.UserId;
                    targetTitle = `seu álbum "${album.title}"`;
                }
            } else if (playlistId) {
                const playlist = await Playlist.findByPk(playlistId);
                if (playlist) {
                    recipientId = playlist.UserId;
                    targetTitle = `sua playlist "${playlist.name}"`;
                }
            }

            // Send notification if not the same user
            if (recipientId && recipientId !== userId) {
                const commenter = await User.findByPk(userId);
                NotificationService.sendToUser(recipientId, {
                    type: 'comment',
                    title: 'Novo Comentário',
                    message: `${commenter.artisticName || commenter.name} comentou em ${targetTitle}.`,
                    data: { trackId, albumId, playlistId, commentId: comment.id }
                }).catch(e => console.error('Notification error:', e));
            }

            // Retornar comentário com dados do usuário para atualização imediata no front
            const fullComment = await Comment.findOne({
                where: { id: comment.id },
                include: [{ model: User, attributes: ['name', 'avatar', 'artisticName'] }]
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

    // Listar Comentários de um Álbum
    async getAlbumComments(req, res) {
        try {
            const { albumId } = req.params;
            const comments = await Comment.findAll({
                where: { AlbumId: albumId },
                include: [{ model: User, attributes: ['name', 'avatar', 'id'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(comments);
        } catch (error) {
            console.error('Erro ao buscar comentários do álbum:', error);
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
            const { Album } = require('../database');
            const comments = await Comment.findAll({
                where: { UserId: userId },
                include: [
                    { model: Track, attributes: ['title', 'id', 'coverpath'] },
                    { model: Playlist, attributes: ['name', 'id', 'cover'] },
                    { model: Album, attributes: ['title', 'id', 'cover'] }
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
    },

    // --- Admin Functions ---

    // Listar TODOS os comentários para moderação
    async adminGetAllComments(req, res) {
        try {
            const comments = await Comment.findAll({
                include: [
                    { model: User, attributes: ['name', 'email', 'avatar', 'id'] },
                    { model: Track, attributes: ['title', 'id', 'artist'] },
                    { model: Playlist, attributes: ['name', 'id'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(comments);
        } catch (error) {
            console.error('Erro admin ao buscar comentários:', error);
            res.status(500).json({ error: 'Erro ao buscar todos os comentários.' });
        }
    },

    // Alternar Aprovação
    async adminToggleApprove(req, res) {
        try {
            const { id } = req.params;
            const comment = await Comment.findByPk(id);
            if (!comment) return res.status(404).json({ error: 'Comentário não encontrado.' });

            comment.approved = !comment.approved;
            await comment.save();

            res.json({ success: true, approved: comment.approved });
        } catch (error) {
            console.error('Erro ao aprovar comentário:', error);
            res.status(500).json({ error: 'Erro ao processar aprovação.' });
        }
    },

    // Admin Deletar
    async adminDeleteComment(req, res) {
        try {
            const { id } = req.params;
            const comment = await Comment.findByPk(id);
            if (!comment) return res.status(404).json({ error: 'Comentário não encontrado.' });

            await comment.destroy();
            res.json({ success: true });
        } catch (error) {
            console.error('Erro admin ao deletar comentário:', error);
            res.status(500).json({ error: 'Erro ao deletar comentário.' });
        }
    }
};
