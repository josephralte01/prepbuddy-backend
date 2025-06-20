// === routes/challengeRoutes.js ===
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendChallenge, respondToChallenge } = require('../controllers/challengeController');
const { getUserChallenges } = require('../controllers/challengeStatusController');

// Send a new challenge
router.post('/', protect, sendChallenge);

// Respond to an existing challenge (accept/reject)
router.post('/:challengeId/respond', protect, respondToChallenge);

// Polling route: Get all challenges for logged-in user
router.get('/status', protect, getUserChallenges);

module.exports = router;
