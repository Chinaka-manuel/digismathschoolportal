import { body, param, query } from 'express-validator'

export const objectIdParam = (name = 'id') => param(name).isMongoId().withMessage('A valid identifier is required')

export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 120 }).withMessage('Search term is too long'),
]

export const requiredString = (field, { min = 1, max = 200, label } = {}) =>
  body(field).trim().isLength({ min, max }).withMessage(`${label || field} must be between ${min} and ${max} characters`)

export const optionalString = (field, { max = 2000 } = {}) =>
  body(field).optional({ nullable: true }).trim().isLength({ max }).withMessage(`${field} is too long`)

export const money = (field = 'amount') =>
  body(field).isFloat({ min: 0 }).withMessage('Amount must be a positive number')

export const optionalObjectId = (field) =>
  body(field).optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage(`${field} must be a valid reference`)
