const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion
} = require('./question.controllers.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const isAdmin = require('../../shared/middleware/isAdmin.js'); // Updated path
const validate = require('../../shared/middleware/validate.js'); // Updated path
const { questionSchema } = require('./question.validation.js'); // Updated path

// Protected routes - questions should not be publicly accessible without authentication
router.get('/', authMiddleware, getAllQuestions);
router.get('/:id', authMiddleware, getQuestion);

// Protected admin routes with validation
router.post('/', authMiddleware, isAdmin, validate(questionSchema), createQuestion);
router.patch('/:id', authMiddleware, isAdmin, validate(questionSchema), updateQuestion);
router.delete('/:id', authMiddleware, isAdmin, deleteQuestion);

module.exports = router;
