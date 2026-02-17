const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const musicController = require('../controllers/musicController');
const streamController = require('../controllers/streamController');
const pendriveController = require('../controllers/pendriveController');
// Playlist routes moved to src/routes/playlistRoutes.js
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth'); // Middleware de Auth

// Rota de Stats (Admin)
router.get('/admin/stats', authMiddleware, adminController.getStats);
router.get('/admin/settings', authMiddleware, adminController.getSettings);
router.post('/admin/settings/upload', authMiddleware, upload.single('settingFile'), adminController.uploadSettingFile);
router.post('/admin/settings', authMiddleware, adminController.updateSetting);
router.get('/settings', adminController.getSettings); // Public route for frontend

// Notification Management (Admin)
router.get('/admin/notifications', authMiddleware, adminController.getNotifications);
router.patch('/admin/notifications/:id/read', authMiddleware, adminController.markNotificationRead);
router.post('/admin/notifications/read-all', authMiddleware, adminController.markAllNotificationsRead);

// User Management (Admin)
router.get('/admin/users', authMiddleware, adminController.getUsers);
router.patch('/admin/users/:id/ban', authMiddleware, adminController.toggleBan);
router.post('/admin/users/:id/credits', authMiddleware, adminController.updateUserCredits);

// Rota para pegar músicas do próprio usuário (Dashboard)
router.get('/my-tracks', authMiddleware, musicController.getMyTracks);

// Uploads (Protegidos)
router.post('/upload', authMiddleware, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }, { name: 'karaoke', maxCount: 1 }]), musicController.uploadTrack);
router.patch('/:id/karaoke', authMiddleware, upload.fields([{ name: 'karaoke', maxCount: 1 }]), musicController.updateTrackKaraoke);

// Upload de Álbum (ZIP/RAR) - Protegido
const uploadAlbumController = require('../controllers/uploadAlbumController');
router.post('/preview-album', authMiddleware, upload.fields([{ name: 'file' }, { name: 'cover' }]), uploadAlbumController.previewAlbum);
router.post('/confirm-album', authMiddleware, upload.none(), uploadAlbumController.confirmAlbum);

// Músicas CRUD
router.get('/', musicController.getAllTracks);
router.patch('/:id', authMiddleware, upload.fields([{ name: 'cover', maxCount: 1 }]), musicController.updateTrack);
router.delete('/:id', musicController.deleteTrack);

router.get('/stream/:id', streamController.streamTrack);
router.get('/pendrive/smart-fill', pendriveController.getSmartFill); // [NEW] Smart Fill
router.post('/pendrive', pendriveController.createPenDrive);

// Rotas de Gêneros
router.get('/genres', musicController.getGenres);
router.get('/genres/:genre', musicController.getTracksByGenre);

// Artist Profile Routes
// Artist Profile Routes
const artistController = require('../controllers/artistController');
const albumController = require('../controllers/albumController');

router.get('/artists/search', artistController.searchArtists); // [NEW] Search Route
router.get('/artist/stats', authMiddleware, artistController.getArtistStats); // [NEW] Antes de :id
router.get('/artist/:id', artistController.getArtistProfile);
router.post('/artist/news', authMiddleware, artistController.createNews);

// Album Routes
router.get('/albums/featured', albumController.getFeaturedAlbums); // [NEW]
router.get('/albums/:id', albumController.getAlbum);
router.get('/artist/:id/albums', albumController.getArtistAlbums);
router.patch('/album/:id', authMiddleware, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), albumController.updateAlbum);
router.delete('/album/:id', authMiddleware, albumController.deleteAlbum);

// Trending Route
const TrendingService = require('../services/TrendingService');
router.get('/trending', async (req, res) => {
    const tracks = await TrendingService.getTrending();
    res.json(tracks);
});

module.exports = router;


