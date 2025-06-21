const express = require('express');
const router = express.Router();
const { recoverStreak, getStreakStatus } = require('./streak.controller.js');
const authMiddleware = require('../../shared/middleware/authMiddleware.js');

// All streak routes require authentication
router.use(authMiddleware);

// Get current streak status for the logged-in user
router.get('/status', getStreakStatus);

// Attempt to recover a lost streak
router.post('/recover', recoverStreak);

module.exports = router;
