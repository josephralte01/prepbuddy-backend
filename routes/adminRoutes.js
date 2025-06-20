const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const {
  getAdminStats,
  manualXPControl
} = require('../controllers/adminController');

// Protected Admin Routes
router.get('/stats', auth, getAdminStats); // Admin dashboard stats
router.post('/xp-control', auth, isAdmin, manualXPControl); // Manual XP Control by Admin

module.exports = router;
