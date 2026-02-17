const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// Checkout
router.post('/checkout', authMiddleware, paymentController.createPreference);

// Mock Payment Success (Dev Only or Phase 2 Mock)
router.post('/mock-success', authMiddleware, paymentController.mockPaymentSuccess);

// Webhook (No auth middleware usually, requires signature verification)
router.post('/webhook', paymentController.handleWebhook);

// Manual Confirmation (Auth required)
router.post('/confirm-manual', authMiddleware, paymentController.confirmManualPayment);

module.exports = router;
