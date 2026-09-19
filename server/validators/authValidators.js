import { body } from 'express-validator'

const email = () => body('email').isEmail().withMessage('A valid email is required').normalizeEmail()
const password = (field = 'password') => body(field)
  .isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters')
  .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain a number')

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be at least 2 characters'),
  email(),
  password(),
]

export const loginRules = [
  email(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
]

export const forgotPasswordRules = [email()]

export const resetPasswordRules = [
  body('token').isString().isLength({ min: 20 }).withMessage('Reset token is required'),
  password(),
]

export const changePasswordRules = [
  body('currentPassword').isString().isLength({ min: 1 }).withMessage('Current password is required'),
  password('newPassword'),
]
