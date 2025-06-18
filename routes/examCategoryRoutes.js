const express = require('express');
const router = express.Router();
const { 
  createExamCategory, 
  getAllExamCategories, 
  getExamCategory, 
  updateExamCategory, 
  deleteExamCategory 
} = require('../controllers/examCategoryController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { examCategorySchema } = require('../validations/examCategoryValidation');

// Public routes
router.get('/', getAllExamCategories);
router.get('/:id', getExamCategory);

// Protected admin routes with validation
router.post('/', auth, isAdmin, validate(examCategorySchema), createExamCategory);
router.patch('/:id', auth, isAdmin, validate(examCategorySchema), updateExamCategory);
router.delete('/:id', auth, isAdmin, deleteExamCategory);

module.exports = router;