const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.type === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
};

// All routes require auth and admin privileges
// Public/Auth Routes
router.get('/library', authMiddleware, userController.getLibrary); // [NEW] Unified Library
router.get('/user-search', authMiddleware, userController.searchUsers); // [NEW] Chat Search
router.get('/:id', authMiddleware, userController.getUserProfile); // [NEW] Public Profile

// Admin Routes
router.use(authMiddleware);
router.use(adminMiddleware);

const adminController = require('../controllers/adminController');

router.get('/export/csv', adminController.exportUsersCSV); // Fixed path if needed, or keep as export
router.get('/', userController.listUsers);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
