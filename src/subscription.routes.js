const express = require('express');
const router = express.Router();
// Paths relative to src/
const authMiddleware = require('./shared/middleware/authMiddleware.js');
const {
  getPlans,
  createOrder,
  verifyPayment,
  getMySubscription
} = require('./subscription.controller.js'); // Path to the controller in src/

// Public: View plans
router.get('/plans', getPlans);

// Authenticated: Create order, verify, get status
router.post('/create-order', authMiddleware, createOrder); // Renamed to /create-order for clarity
router.post('/verify-payment', authMiddleware, verifyPayment); // Renamed for clarity
router.get('/my-status', authMiddleware, getMySubscription); // Renamed for clarity

module.exports = router;
