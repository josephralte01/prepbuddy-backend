const Joi = require('joi');
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Create/update subject schema
const subjectSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name cannot exceed {#limit} characters',
    'any.required': 'Name is required'
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
  
  isActive: Joi.boolean().default(true)
});

module.exports = {
  subjectSchema
};
