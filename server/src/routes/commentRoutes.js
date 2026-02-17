const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Rotas de Comentários
router.post('/', authMiddleware, commentController.addComment);
router.get('/track/:trackId', commentController.getTrackComments);
router.get('/playlist/:playlistId', commentController.getPlaylistComments);
router.get('/album/:albumId', commentController.getAlbumComments);
router.get('/user', authMiddleware, commentController.getUserComments);
router.delete('/:id', authMiddleware, commentController.deleteComment);

// Admin Routes
router.get('/admin/all', authMiddleware, adminMiddleware, commentController.adminGetAllComments);
router.patch('/admin/approve/:id', authMiddleware, adminMiddleware, commentController.adminToggleApprove);
router.delete('/admin/:id', authMiddleware, adminMiddleware, commentController.adminDeleteComment);

module.exports = router;
