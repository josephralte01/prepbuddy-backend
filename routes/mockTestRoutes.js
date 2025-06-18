const express = require('express');
const router = express.Router();
const { 
  createMockTest, 
  getAllMockTests, 
  getMockTest, 
  getMockTestWithQuestions,
  updateMockTest, 
  deleteMockTest 
} = require('../controllers/mockTestController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { mockTestSchema } = require('../validations/mockTestValidation');

// Protected routes
router.get('/', auth, getAllMockTests);
router.get('/:id', auth, getMockTest);
router.get('/:id/questions', auth, getMockTestWithQuestions);

// Protected admin routes with validation
router.post('/', auth, isAdmin, validate(mockTestSchema), createMockTest);
router.patch('/:id', auth, isAdmin, validate(mockTestSchema), updateMockTest);
router.delete('/:id', auth, isAdmin, deleteMockTest);

module.exports = router;