const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');

// Rotas de Comentários
router.post('/', authMiddleware, commentController.addComment);
router.get('/track/:trackId', commentController.getTrackComments); // Pode ser público
router.get('/playlist/:playlistId', commentController.getPlaylistComments); // [NEW]
router.get('/user', authMiddleware, commentController.getUserComments);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;
