const express = require('express');
const router = express.Router();
const { 
  getUserProgress, 
  markTopicCompleted, 
  submitQuizResult 
} = require('../controllers/userProgressController');
const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Quiz result validation schema
const quizResultSchema = Joi.object({
  score: Joi.number().required().min(0).messages({
    'number.base': 'Score must be a number',
    'number.min': 'Score cannot be negative',
    'any.required': 'Score is required'
  }),
  
  totalQuestions: Joi.number().required().integer().min(1).messages({
    'number.base': 'Total questions must be a number',
    'number.integer': 'Total questions must be an integer',
    'number.min': 'Total questions must be at least {#limit}',
    'any.required': 'Total questions is required'
  }),
  
  timeTaken: Joi.number().required().min(0).messages({
    'number.base': 'Time taken must be a number',
    'number.min': 'Time taken cannot be negative',
    'any.required': 'Time taken is required'
  })
});

// All routes are protected and specific to the authenticated user
router.get('/:examCategoryId', auth, getUserProgress);
router.post('/:examCategoryId/topics/:topicId', auth, markTopicCompleted);
router.post(
  '/:examCategoryId/quizzes/:quizId', 
  auth, 
  validate(quizResultSchema), 
  submitQuizResult
);

module.exports = router;