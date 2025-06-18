const Joi = require('joi');

// Register validation schema
const registerSchema = Joi.object({
  name: Joi.string().required().min(3).max(50).messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name cannot exceed {#limit} characters',
    'any.required': 'Name is required'
  }),
  
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().required().min(6).messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least {#limit} characters long',
    'any.required': 'Password is required'
  })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

module.exports = {
  registerSchema,
  loginSchema
};