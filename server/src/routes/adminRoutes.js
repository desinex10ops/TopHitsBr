const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminFinanceController = require('../controllers/adminFinanceController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply Auth and Admin checks to all routes
router.use(authMiddleware, adminMiddleware);

// Dashboard Stats
router.get('/stats', adminController.getStats);
router.get('/finance/summary', adminFinanceController.getFinanceSummary);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSetting);
router.post('/settings/upload', adminController.uploadSettingFile); // Multer middleware needed if implemented fully

// Users Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-ban', adminController.toggleBan);
router.post('/users/:id/credits', adminController.updateUserCredits);
router.get('/users/export/csv', adminController.exportUsersCSV);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.patch('/notifications/:id/read', adminController.markNotificationRead);
router.patch('/notifications/read-all', adminController.markAllNotificationsRead);

// Withdrawals (Finance)
router.get('/withdrawals', adminFinanceController.listAllWithdrawals);
router.put('/withdrawals/:id', adminFinanceController.manageWithdrawal);

// Content Moderation (Tracks)
router.get('/tracks', adminController.getTracks);
router.delete('/tracks/:id', adminController.deleteTrack);
router.patch('/tracks/:id/feature', adminController.toggleTrackFeature);

// Content Moderation (Albums)
router.get('/albums', adminController.getAlbums);
router.delete('/albums/:id', adminController.deleteAlbum);
router.patch('/albums/:id/feature', adminController.toggleAlbumFeature);

// Export Sales
router.get('/sales/export/csv', adminController.exportSalesCSV);

module.exports = router;
