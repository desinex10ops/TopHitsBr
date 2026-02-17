const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const adminFinanceController = require('../controllers/adminFinanceController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Wallet (User)
router.get('/wallet', authMiddleware, financeController.getWallet);
router.get('/transactions', authMiddleware, financeController.getTransactions);

// Withdrawals (User)
router.post('/withdrawals', authMiddleware, financeController.requestWithdrawal);
router.get('/withdrawals', authMiddleware, financeController.getWithdrawals);

// Finance Management (Admin)
router.get('/admin/withdrawals', authMiddleware, adminMiddleware, adminFinanceController.listAllWithdrawals);
router.patch('/admin/withdrawals/:id', authMiddleware, adminMiddleware, adminFinanceController.manageWithdrawal);
router.get('/admin/summary', authMiddleware, adminMiddleware, adminFinanceController.getFinanceSummary);

module.exports = router;
