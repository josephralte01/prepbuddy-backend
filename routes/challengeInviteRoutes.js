// === routes/challengeInviteRoutes.js ===
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createInvite,
  getMyChallenges,
  respondToInvite
} = require('../controllers/challengeInviteController');

router.post('/', protect, createInvite);
router.get('/mine', protect, getMyChallenges);
router.post('/respond', protect, respondToInvite);

module.exports = router;
