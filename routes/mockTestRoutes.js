// === routes/mockTestRoutes.js ===
const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Apply protection to all routes below
router.use(isAuthenticated);

router.post('/', mockTestController.createMockTest);
router.get('/', mockTestController.getAllMockTests);
router.get('/:id', mockTestController.getMockTestById);
router.put('/:id', mockTestController.updateMockTest);
router.delete('/:id', mockTestController.deleteMockTest);

module.exports = router;
