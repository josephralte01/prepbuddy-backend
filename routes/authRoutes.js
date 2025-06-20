// === routes/authRoutes.js ===
const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  getMe,
  registerUser,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword
} = require('../controllers/authController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', isAuthenticated, getMe);

router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', isAuthenticated, resendVerificationEmail);

module.exports = router;
