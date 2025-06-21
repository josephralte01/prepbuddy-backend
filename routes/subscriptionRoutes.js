const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const {
  getPlans,
  createOrder,
  verifyPayment,
  getMySubscription
} = require('../controllers/subscriptionController');

// Public: View plans
router.get('/plans', getPlans);

// Authenticated: Create order, verify, get status
router.post('/create', authMiddleware, createOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.get('/status', authMiddleware, getMySubscription);

module.exports = router;
