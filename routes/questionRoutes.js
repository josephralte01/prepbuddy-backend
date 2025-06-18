const express = require('express');
const router = express.Router();
const { 
  createQuestion, 
  getAllQuestions, 
  getQuestion, 
  updateQuestion, 
  deleteQuestion 
} = require('../controllers/questionController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { questionSchema } = require('../validations/questionValidation');

// Protected routes - questions should not be publicly accessible without authentication
router.get('/', auth, getAllQuestions);
router.get('/:id', auth, getQuestion);

// Protected admin routes with validation
router.post('/', auth, isAdmin, validate(questionSchema), createQuestion);
router.patch('/:id', auth, isAdmin, validate(questionSchema), updateQuestion);
router.delete('/:id', auth, isAdmin, deleteQuestion);

module.exports = router;