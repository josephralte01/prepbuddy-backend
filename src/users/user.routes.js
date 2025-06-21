const express = require('express');
const router = express.Router();
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const {
  getPublicProfile,
  updateUsername,
  getStreakReminderStatus, // New controller function
  updateUserProfile      // New controller function
} = require('./user.controller.js'); // Updated path

// TODO: Add Joi validation for request bodies (e.g. updateUsername, updateUserProfile)
// const validate = require('../../shared/middleware/validate.js');
// const { updateUsernameSchema, updateUserProfileSchema } = require('./user.validation.js');


// Public profile route (no auth required)
router.get('/public/:username', getPublicProfile);

// --- Authenticated Routes ---
// Update current user's username
router.put('/me/username', authMiddleware, /* validate(updateUsernameSchema), */ updateUsername);

// Get current user's streak reminder status
router.get('/me/streak-reminder', authMiddleware, getStreakReminderStatus);

// Update current user's profile (bio, profile picture, preferences)
router.put('/me/profile', authMiddleware, /* validate(updateUserProfileSchema), */ updateUserProfile);


module.exports = router;
