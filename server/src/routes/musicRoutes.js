const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const musicController = require('../controllers/musicController');
const streamController = require('../controllers/streamController');
const pendriveController = require('../controllers/pendriveController');
const playlistController = require('../controllers/playlistController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth'); // Middleware de Auth

// Rota de Stats (Admin)
router.get('/admin/stats', authMiddleware, adminController.getStats);
router.get('/admin/settings', authMiddleware, adminController.getSettings);
router.post('/admin/settings/upload', authMiddleware, upload.single('settingFile'), adminController.uploadSettingFile);
router.post('/admin/settings', authMiddleware, adminController.updateSetting);
router.get('/settings', adminController.getSettings); // Public route for frontend

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

router.get('/', musicController.getAllTracks);
router.get('/stream/:id', streamController.streamTrack);
router.post('/pendrive', pendriveController.createPenDrive);

// Rotas de Gêneros
router.get('/genres', musicController.getGenres);
router.get('/genres/:genre', musicController.getTracksByGenre);

// Rotas de Playlists
router.get('/playlists', playlistController.getAutoPlaylists);
router.get('/playlists/user', authMiddleware, playlistController.getUserPlaylists); // Listar do usuário
router.get('/playlists/top', playlistController.getTopPlaylists); // Top Playlists
router.post('/playlists/:id/play', playlistController.incrementPlaylistPlays); // Registrar Play
router.post('/playlists', authMiddleware, playlistController.createUserPlaylist); // Criar
router.post('/playlists/:id/tracks', authMiddleware, playlistController.addTrackToPlaylist); // Add Track
router.post('/playlists/:id/image', authMiddleware, upload.single('cover'), playlistController.uploadPlaylistCover); // [NEW] Upload Cover
router.delete('/playlists/:id/tracks/:trackId', authMiddleware, playlistController.removeTrackFromPlaylist); // Remove Track
router.get('/playlists/:id', playlistController.getPlaylistTracks); // Public/Auto/User tracks logic needs unification? 

// Note: getPlaylistTracks currently handles Auto IDs. We should update it to handle DB IDs too or use separate route.
// For now, let's assume getPlaylistTracks will be updated if needed or we use a separate one. 
// Actually, `getPlaylistTracks` in controller handles 'random', 'top50', etc.
// If valid ID (integer), it should fetch from DB. 
// I should update getPlaylistTracks to switch logic based on ID format.

router.delete('/:id', musicController.deleteTrack);

// Artist Profile Routes
// Artist Profile Routes
const artistController = require('../controllers/artistController');
const albumController = require('../controllers/albumController');

router.get('/artist/stats', authMiddleware, artistController.getArtistStats); // [NEW] Antes de :id
router.get('/artist/:id', artistController.getArtistProfile);
router.post('/artist/news', authMiddleware, artistController.createNews);

// Album Routes
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


