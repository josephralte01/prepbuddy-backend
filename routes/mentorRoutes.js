const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkTierAccess = require('../middleware/checkTierAccess');
const {
  askQuestion,
  getMyQuestions,
  replyToQuestion
} = require('../controllers/mentorController');

// Premium users only
router.post('/ask', auth, checkTierAccess('premium'), askQuestion);
router.get('/my-questions', auth, checkTierAccess('premium'), getMyQuestions);

// Admins only
router.post('/reply/:id', auth, replyToQuestion);

module.exports = router;
