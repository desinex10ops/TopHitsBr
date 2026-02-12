const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middleware/auth');

router.post('/follow/:id', authMiddleware, socialController.followUser);
router.delete('/follow/:id', authMiddleware, socialController.unfollowUser);

router.post('/like/:id', authMiddleware, socialController.likeTrack);
router.delete('/like/:id', authMiddleware, socialController.unlikeTrack);

router.post('/like/playlist/:id', authMiddleware, socialController.likePlaylist);
router.delete('/like/playlist/:id', authMiddleware, socialController.unlikePlaylist);

router.get('/status', authMiddleware, socialController.getSocialStatus);

module.exports = router;
