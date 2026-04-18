const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/auth');
const sellerMiddleware = require('../middleware/seller');
const upload = require('../middleware/upload'); // Reusing existing upload middleware

// Public Routes
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProductById);
router.get('/store/:username', shopController.getProducerStore);
router.get('/check-purchase/:productId', authMiddleware, shopController.checkPurchase);

// Producer Routes (Protected by Auth AND Seller check)
router.post('/products', authMiddleware, sellerMiddleware, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), shopController.createProduct);

router.put('/products/:id', authMiddleware, sellerMiddleware, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), shopController.updateProduct);

router.get('/my-products', authMiddleware, sellerMiddleware, shopController.getMyProducts);
router.get('/my-orders', authMiddleware, shopController.getMyOrders); // Buyer Orders (Auth only suffices)
router.get('/sales', authMiddleware, sellerMiddleware, shopController.getProducerSales); // Producer Sales
router.delete('/products/:id', authMiddleware, sellerMiddleware, shopController.deleteProduct);

const deliveryController = require('../controllers/deliveryController');

// Dashboard Stats
router.get('/stats', authMiddleware, sellerMiddleware, shopController.getDashboardStats);

const adminMiddleware = require('../middleware/admin');

// Anti-Piracy / Delivery Routes
router.post('/delivery/link', authMiddleware, deliveryController.generateLink);
router.get('/delivery/download/:token', deliveryController.downloadFile); // Public access via token
const adminController = require('../controllers/adminController');
router.get('/admin/delivery/logs', authMiddleware, adminMiddleware, deliveryController.retrieveLogs);
router.get('/admin/export-sales', authMiddleware, adminMiddleware, adminController.exportSalesCSV);

// Checkout and Purchases
router.post('/checkout', authMiddleware, shopController.checkout);

// Future: Withdrawals (handled by financeController right now)
// router.post('/withdrawals', authMiddleware, shopController.requestWithdrawal);

module.exports = router;
