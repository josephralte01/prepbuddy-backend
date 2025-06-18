const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPlans,
  createOrder,
  verifyPayment,
  getMySubscription
} = require('../controllers/subscriptionController');

// Public: View plans
router.get('/plans', getPlans);

// Authenticated: Create order, verify, get status
router.post('/create', auth, createOrder);
router.post('/verify', auth, verifyPayment);
router.get('/status', auth, getMySubscription);

module.exports = router;
