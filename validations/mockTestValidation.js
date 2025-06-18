const Joi = require('joi');
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Create/update mock test schema
const mockTestSchema = Joi.object({
  title: Joi.string().required().min(5).max(200).messages({
    'string.base': 'Title must be a string',
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least {#limit} characters long',
    'string.max': 'Title cannot exceed {#limit} characters',
    'any.required': 'Title is required'
  }),
  
  description: Joi.string().min(10).max(1000).messages({
    'string.base': 'Description must be a string',
    'string.min': 'Description must be at least {#limit} characters long',
    'string.max': 'Description cannot exceed {#limit} characters'
  }),
  
  examCategoryId: Joi.string().required().custom(objectIdValidation).messages({
    'string.base': 'Exam category ID must be a string',
    'string.empty': 'Exam category ID is required',
    'any.required': 'Exam category ID is required',
    'any.invalid': 'Exam category ID must be a valid MongoDB ObjectId'
  }),
  
  subjectIds: Joi.array().items(
    Joi.string().custom(objectIdValidation).messages({
      'string.base': 'Subject ID must be a string',
      'any.invalid': 'Subject ID must be a valid MongoDB ObjectId'
    })
  ).messages({
    'array.base': 'Subject IDs must be an array'
  }),
  
  duration: Joi.number().integer().min(5).required().messages({
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be an integer',
    'number.min': 'Duration must be at least {#limit} minutes',
    'any.required': 'Duration is required'
  }),
  
  totalQuestions: Joi.number().integer().min(1).required().messages({
    'number.base': 'Total questions must be a number',
    'number.integer': 'Total questions must be an integer',
    'number.min': 'Total questions must be at least {#limit}',
    'any.required': 'Total questions is required'
  }),
  
  questionIds: Joi.array().items(
    Joi.string().custom(objectIdValidation).messages({
      'string.base': 'Question ID must be a string',
      'any.invalid': 'Question ID must be a valid MongoDB ObjectId'
    })
  ).messages({
    'array.base': 'Question IDs must be an array'
  }),
  
  isActive: Joi.boolean().default(true)
});

module.exports = {
  mockTestSchema
};