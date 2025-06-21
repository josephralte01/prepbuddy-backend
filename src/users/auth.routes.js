const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  resendVerificationEmail
} = require('./auth.controller.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const validate = require('../../shared/middleware/validate.js'); // Updated path
const {
    registerSchema,
    loginSchema,
    emailSchema,
    passwordResetSchema
} = require('./auth.validation.js'); // Updated path

// Public routes with validation
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

router.get('/verify-email/:token', verifyEmail);

router.post('/forgot-password', validate(emailSchema), forgotPassword);
router.get('/reset-password/:token', validateResetToken); // Validates token via params, schema might be for body
router.post('/reset-password/:token', validate(passwordResetSchema), resetPassword);


// Authenticated routes
router.post('/logout', authMiddleware, logoutUser); // authMiddleware to ensure req.user if needed by logout (e.g. audit)
router.get('/me', authMiddleware, getMe);
router.post('/resend-verification', authMiddleware, resendVerificationEmail); // User must be logged in to resend to their own email

module.exports = router;
