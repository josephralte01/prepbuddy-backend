const express = require('express');
const router = express.Router();
// Corrected paths relative to src/users/admin.routes.js
const authMiddleware = require('../../shared/middleware/authMiddleware.js');
const isAdmin = require('../../shared/middleware/isAdmin.js');
const {
  getAdminStats,
  manualXPControl,
  getAllUsersAdmin,       // Added new controller function
  updateUserRoleAdmin     // Added new controller function
} = require('./admin.controller.js'); // Corrected path

// All routes below are protected and require admin role
router.use(authMiddleware);
router.use(isAdmin); // Apply admin check to all routes in this file

// Dashboard stats
router.get('/stats', getAdminStats);

// Manual XP Control by Admin
router.post('/xp-control', manualXPControl);

// User Management by Admin
router.get('/users', getAllUsersAdmin); // Get all users
router.put('/users/:userId/access', updateUserRoleAdmin); // Update user role or tier


// TODO: Add more admin routes for content management, etc.
// Example:
// router.get('/content/pending', getPendingContentForApproval);
// router.put('/content/:contentId/approve', approveContent);

module.exports = router;
