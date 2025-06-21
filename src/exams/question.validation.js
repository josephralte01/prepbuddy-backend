const Joi = require('joi');
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Option schema for questions
const optionSchema = Joi.object({
  text: Joi.string().required().min(1).messages({
    'string.base': 'Option text must be a string',
    'string.empty': 'Option text is required',
    'string.min': 'Option text cannot be empty',
    'any.required': 'Option text is required'
  }),
  
  isCorrect: Joi.boolean().required().messages({
    'boolean.base': 'isCorrect must be a boolean',
    'any.required': 'isCorrect is required'
  })
});

// Create/update question schema
const questionSchema = Joi.object({
  text: Joi.string().required().min(5).messages({
    'string.base': 'Question text must be a string',
    'string.empty': 'Question text is required',
    'string.min': 'Question text must be at least {#limit} characters long',
    'any.required': 'Question text is required'
  }),
  
  options: Joi.array().items(optionSchema).min(2).required().messages({
    'array.base': 'Options must be an array',
    'array.min': 'At least {#limit} options are required',
    'any.required': 'Options are required'
  }),
  
  explanation: Joi.string().min(10).messages({
    'string.base': 'Explanation must be a string',
    'string.min': 'Explanation must be at least {#limit} characters long'
  }),
  
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium').messages({
    'string.base': 'Difficulty must be a string',
    'any.only': 'Difficulty must be one of: easy, medium, hard'
  }),
  
  topicId: Joi.string().custom(objectIdValidation).allow(null).messages({
    'string.base': 'Topic ID must be a string',
    'any.invalid': 'Topic ID must be a valid MongoDB ObjectId'
  }),
  
  subjectId: Joi.string().required().custom(objectIdValidation).messages({
    'string.base': 'Subject ID must be a string',
    'string.empty': 'Subject ID is required',
    'any.required': 'Subject ID is required',
    'any.invalid': 'Subject ID must be a valid MongoDB ObjectId'
  }),
  
  examCategoryId: Joi.string().required().custom(objectIdValidation).messages({
    'string.base': 'Exam category ID must be a string',
    'string.empty': 'Exam category ID is required',
    'any.required': 'Exam category ID is required',
    'any.invalid': 'Exam category ID must be a valid MongoDB ObjectId'
  }),
  
  isActive: Joi.boolean().default(true)
});

// Validate that at least one option is marked as correct
const validateCorrectOption = (value, helpers) => {
  const hasCorrectOption = value.some(option => option.isCorrect);
  
  if (!hasCorrectOption) {
    return helpers.error('array.includesCorrectOption');
  }
  
  return value;
};

// Extended question schema with custom validation
const questionSchemaWithValidation = questionSchema.custom((value, helpers) => {
  return validateCorrectOption(value.options, helpers);
}, {
  message: 'At least one option must be marked as correct'
});

module.exports = {
  questionSchema: questionSchemaWithValidation
};
