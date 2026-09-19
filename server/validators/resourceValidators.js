import { body } from 'express-validator'
import { money, optionalObjectId, optionalString, requiredString } from './commonValidators.js'

export const sessionRules = [
  requiredString('name', { min: 4, max: 40, label: 'Session name' }),
  body('startYear').isInt({ min: 2000, max: 2100 }).withMessage('Start year must be a valid year'),
  body('endYear').isInt({ min: 2000, max: 2100 }).withMessage('End year must be a valid year'),
]

export const termRules = [
  requiredString('name', { min: 3, max: 40, label: 'Term name' }),
  body('session').isMongoId().withMessage('A session is required'),
]

export const subjectRules = [
  requiredString('name', { min: 2, max: 80, label: 'Subject name' }),
  requiredString('code', { min: 2, max: 12, label: 'Subject code' }),
  optionalObjectId('department'),
]

export const departmentRules = [
  requiredString('name', { min: 2, max: 80, label: 'Department name' }),
  optionalString('description'),
]

export const classRules = [
  requiredString('name', { min: 1, max: 40, label: 'Class name' }),
  body('level').isIn(['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary']).withMessage('A valid level is required'),
  body('capacity').optional().isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),
]

export const feeRules = [
  requiredString('name', { min: 2, max: 80, label: 'Fee name' }),
  money('amount'),
  optionalObjectId('classRef'),
  optionalObjectId('session'),
  optionalObjectId('term'),
]

export const invoiceRules = [
  body('student').isMongoId().withMessage('A student is required'),
  money('amount'),
]

export const contactRules = [
  requiredString('name', { min: 2, max: 80, label: 'Name' }),
  body('email').isEmail().withMessage('A valid email is required'),
  requiredString('message', { min: 10, max: 4000, label: 'Message' }),
]
