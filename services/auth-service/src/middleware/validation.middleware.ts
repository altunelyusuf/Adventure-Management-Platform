import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler.middleware';

/**
 * Validation middleware factory
 */
export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ValidationError('Validation failed', details);
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
}

/**
 * Validation schemas
 */
export const authValidationSchemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(8)
      .pattern(/[A-Z]/, 'uppercase')
      .pattern(/[a-z]/, 'lowercase')
      .pattern(/[0-9]/, 'number')
      .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'special character')
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.name': 'Password must contain at least one {#name}',
        'any.required': 'Password is required',
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must be at most 50 characters long',
        'any.required': 'Username is required',
      }),
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Verification token is required',
      }),
  }),

  resendVerification: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required',
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/[A-Z]/, 'uppercase')
      .pattern(/[a-z]/, 'lowercase')
      .pattern(/[0-9]/, 'number')
      .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'special character')
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.name': 'Password must contain at least one {#name}',
        'any.required': 'Password is required',
      }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
  }),
};
