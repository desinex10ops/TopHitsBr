const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Create Review (Auth required)
router.post('/', authMiddleware, reviewController.createReview);

// Get Reviews for a Product
router.get('/:productId', reviewController.getProductReviews);

// Get Reviews for Producer (Auth required)
router.get('/producer/all', authMiddleware, reviewController.getProducerReviews);

// Delete Review (Auth required)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
