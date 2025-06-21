const Joi = require('joi');
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Create/update topic schema
const topicSchema = Joi.object({
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
  
  subjectId: Joi.string().required().custom(objectIdValidation).messages({
    'string.base': 'Subject ID must be a string',
    'string.empty': 'Subject ID is required',
    'any.required': 'Subject ID is required',
    'any.invalid': 'Subject ID must be a valid MongoDB ObjectId'
  }),
  
  content: Joi.string().required().min(50).messages({
    'string.base': 'Content must be a string',
    'string.empty': 'Content is required',
    'string.min': 'Content must be at least {#limit} characters long',
    'any.required': 'Content is required'
  }),
  
  order: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Order must be a number',
    'number.integer': 'Order must be an integer',
    'number.min': 'Order must be at least {#limit}'
  }),
  
  isActive: Joi.boolean().default(true)
});

module.exports = {
  topicSchema
};
