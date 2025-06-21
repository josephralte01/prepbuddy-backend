const express = require('express');
const router = express.Router();
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const {
  startMockTestSession,
  submitMockTestSession,
} = require('./mockTestSession.controllers.js'); // Updated path

// All routes require authentication
router.use(authMiddleware);

router.post('/start', startMockTestSession);
// Assuming the session ID is passed in the URL for submission
router.post('/:id/submit', submitMockTestSession);

module.exports = router;
