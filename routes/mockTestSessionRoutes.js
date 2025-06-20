const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const {
  startMockTestSession,
  submitMockTestSession,
} = require('../controllers/mockTestSessionController');

router.post('/start', isAuthenticated, startMockTestSession);
router.post('/submit', isAuthenticated, submitMockTestSession);

module.exports = router;
