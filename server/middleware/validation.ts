import { body, param } from 'express-validator';

export const validateShortenUrl = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    }).withMessage('Please provide a valid URL with http:// or https://')
    .isLength({ max: 2000 }).withMessage('URL must be less than 2000 characters'),
  
  body('customCode')
    .optional()
    .isString().withMessage('Custom code must be a string')
    .isLength({ min: 3, max: 20 }).withMessage('Custom code must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Custom code can only contain letters, numbers, underscores, and hyphens')
];

export const validateShortCode = [
  param('shortCode')
    .trim()
    .notEmpty().withMessage('Short code is required')
    .isLength({ min: 4, max: 20 }).withMessage('Short code must be between 4 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Invalid short code format')
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt()
];
