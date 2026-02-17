const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Coupons
router.post('/coupons', authMiddleware, marketingController.createCoupon);
router.get('/coupons', authMiddleware, marketingController.getCoupons);
router.delete('/coupons/:id', authMiddleware, marketingController.deleteCoupon);

// Public/Checkout Validation
router.post('/coupons/validate', authMiddleware, marketingController.validateCoupon);

// Admin Global Coupons
router.post('/admin/coupons', authMiddleware, adminMiddleware, marketingController.adminCreateCoupon);
router.get('/admin/coupons', authMiddleware, adminMiddleware, marketingController.adminGetCoupons);
router.delete('/admin/coupons/:id', authMiddleware, adminMiddleware, marketingController.adminDeleteCoupon);

module.exports = router;
