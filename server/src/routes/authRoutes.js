const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');

// Rotas Públicas
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Rotas Privadas
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }, { name: 'bannerVideo', maxCount: 1 }]), authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword); // [NEW]
router.put('/preferences', authMiddleware, authController.updatePreferences); // [NEW]
router.post('/become-seller', authMiddleware, authController.becomeSeller); // [NEW] Phase 6

module.exports = router;
