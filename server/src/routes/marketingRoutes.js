const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const authMiddleware = require('../middleware/auth');

// Coupons
router.post('/coupons', authMiddleware, marketingController.createCoupon);
router.get('/coupons', authMiddleware, marketingController.getCoupons);
router.delete('/coupons/:id', authMiddleware, marketingController.deleteCoupon);

module.exports = router;
