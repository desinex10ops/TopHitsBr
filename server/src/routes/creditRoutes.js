const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const boostController = require('../controllers/boostController');
const adminCreditController = require('../controllers/adminCreditController');
const authMiddleware = require('../middleware/auth');

// Wallet Routes
router.get('/wallet', authMiddleware, financeController.getWallet);
router.get('/wallet/transactions', authMiddleware, financeController.getTransactions);
const paymentController = require('../controllers/paymentController');
router.post('/buy', authMiddleware, paymentController.createCreditPreference);

// Boost Routes
router.post('/boost', authMiddleware, boostController.createBoost);
router.get('/boost', authMiddleware, boostController.getMyBoosts);
router.get('/boost/active', boostController.getActiveBoosts); // Public/Engine use
router.get('/boost/calculate-cost', boostController.calculateBoostCost); // New endpoint for logic/cost calculation

// Admin Routes (Should have Admin Check middleware ideally, using authMiddleware for now)
router.get('/admin/packages', authMiddleware, adminCreditController.getPackages);
router.post('/admin/packages', authMiddleware, adminCreditController.createPackage);
router.put('/admin/packages/:id', authMiddleware, adminCreditController.updatePackage);
router.delete('/admin/packages/:id', authMiddleware, adminCreditController.deletePackage);
router.get('/admin/settings', authMiddleware, adminCreditController.getGlobalSettings);

module.exports = router;
