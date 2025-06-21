const express = require('express');
const router = express.Router();
// Paths relative to src/
const authMiddleware = require('./shared/middleware/authMiddleware.js');
const isAdmin = require('./shared/middleware/isAdmin.js'); // For admin/mentor specific actions
const checkTierAccess = require('./shared/middleware/checkTierAccess.js');
const {
  askQuestion,
  getMyQuestions,
  replyToQuestion,
  getAllMentorQuestions,      // New controller function
  updateMentorQuestionStatus  // New controller function
} = require('./mentor.controller.js');
// const validate = require('./shared/middleware/validate.js');
// const { askMentorQuestionSchema, replySchema } = require('./mentor.validation.js'); // Example validation

// --- User-facing Routes (Premium Tier) ---
// Ask a new question to a mentor
router.post(
    '/ask',
    authMiddleware,
    checkTierAccess('premium'),
    /* validate(askMentorQuestionSchema), */
    askQuestion
);

// Get questions submitted by the current user
router.get('/my-questions', authMiddleware, checkTierAccess('premium'), getMyQuestions);


// --- Mentor/Admin Routes ---
// Reply to a specific question
router.post(
    '/:id/reply',
    authMiddleware,
    isAdmin, // Or a custom isMentorOrAdmin middleware
    /* validate(replySchema), */
    replyToQuestion
);

// Get all mentor questions (e.g., for admin/mentor dashboard)
router.get(
    '/all',
    authMiddleware,
    isAdmin, // Or a custom isMentorOrAdmin
    getAllMentorQuestions
);

// Update status of a mentor question (e.g., assign, close)
router.patch(
    '/:id/status',
    authMiddleware,
    isAdmin, // Or a custom isMentorOrAdmin
    updateMentorQuestionStatus
);

module.exports = router;
