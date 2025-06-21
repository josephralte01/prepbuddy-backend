const express = require('express');
const router = express.Router();
const {
  getXPLogs,
  getTopXPEarners,
  manualAdjustXP,
} = require('./xpLog.controller.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const isAdmin = require('../../shared/middleware/isAdmin.js'); // Updated path

router.get('/', authMiddleware, isAdmin, getXPLogs);
router.get('/top-users', authMiddleware, isAdmin, getTopXPEarners);
router.post('/manual', authMiddleware, isAdmin, manualAdjustXP);

module.exports = router;
