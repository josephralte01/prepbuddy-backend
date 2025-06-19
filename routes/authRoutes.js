// === routes/authRoutes.js ===
const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  getMe,
  registerUser,
  verifyEmail
} = require('../controllers/authController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', isAuthenticated, getMe);

module.exports = router;
