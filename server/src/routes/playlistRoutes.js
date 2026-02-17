const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auto Playlists
// Auto Playlists
router.get('/auto', playlistController.getAutoPlaylists); // Changed to /auto to avoid conflict with /:id if not careful, but plan said /
router.get('/top', playlistController.getTopPlaylists);
router.get('/search', playlistController.searchPlaylists); // [NEW] Search Route
router.get('/user', authMiddleware, playlistController.getUserPlaylists); // User's Playlists
router.get('/:id', playlistController.getPlaylistTracks); // Works for 'random', 'top50', 'vibe-*' and component IDs

// User Actions
router.post('/', authMiddleware, playlistController.createUserPlaylist);
router.post('/:id/play', playlistController.incrementPlaylistPlays);
router.post('/:id/tracks', authMiddleware, playlistController.addTrackToPlaylist);
router.post('/:id/image', authMiddleware, upload.single('cover'), playlistController.uploadPlaylistCover);
router.delete('/:id/tracks/:trackId', authMiddleware, playlistController.removeTrackFromPlaylist);

module.exports = router;
