const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/auth');

// Wallet
router.get('/wallet', authMiddleware, financeController.getWallet);
router.get('/transactions', authMiddleware, financeController.getTransactions);

// Withdrawals
router.post('/withdrawals', authMiddleware, financeController.requestWithdrawal);
router.get('/withdrawals', authMiddleware, financeController.getWithdrawals);

module.exports = router;
