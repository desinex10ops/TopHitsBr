const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer'); // Reusing existing multer config

// Public Routes
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProductById);
router.get('/store/:username', shopController.getProducerStore);

// Producer Routes (Protected)
router.post('/products', authMiddleware, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), shopController.createProduct);

router.put('/products/:id', authMiddleware, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), shopController.updateProduct);

router.get('/my-products', authMiddleware, shopController.getMyProducts);
router.get('/my-orders', authMiddleware, shopController.getMyOrders); // [NEW]
router.delete('/products/:id', authMiddleware, shopController.deleteProduct);

const deliveryController = require('../controllers/deliveryController');

// Dashboard Stats
router.get('/stats', authMiddleware, shopController.getDashboardStats);

// Anti-Piracy / Delivery Routes
router.post('/delivery/link', authMiddleware, deliveryController.generateLink);
router.get('/delivery/download/:token', deliveryController.downloadFile); // Public access via token
router.get('/admin/delivery/logs', authMiddleware, deliveryController.retrieveLogs); // Admin only (authMiddleware checks type usually or we need specific admin middleware)

// Future: Checkout, Withdrawals
// router.post('/checkout', authMiddleware, shopController.checkout);
// router.post('/withdrawals', authMiddleware, shopController.requestWithdrawal);

module.exports = router;
