const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer'); // Para avatar/banner depois

// Rotas Públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas Privadas
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }, { name: 'bannerVideo', maxCount: 1 }]), authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword); // [NEW]
router.put('/preferences', authMiddleware, authController.updatePreferences); // [NEW]

module.exports = router;
