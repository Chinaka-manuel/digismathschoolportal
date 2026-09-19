import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { authLimiter, passwordResetLimiter, registerLimiter } from '../middleware/rateLimiters.js'
import {
  changePasswordRules,
  forgotPasswordRules,
  loginRules,
  registerRules,
  resetPasswordRules,
} from '../validators/authValidators.js'
import * as auth from '../controllers/authController.js'

const router = Router()

router.post('/register', registerLimiter, validateRequest(registerRules), auth.register)
router.post('/login', authLimiter, validateRequest(loginRules), auth.login)
router.post('/refresh', auth.refresh)
router.post('/logout', auth.logout)
router.get('/me', authenticate, auth.me)

router.post('/forgot-password', passwordResetLimiter, validateRequest(forgotPasswordRules), auth.forgotPassword)
router.post('/reset-password', passwordResetLimiter, validateRequest(resetPasswordRules), auth.performPasswordReset)
router.post('/change-password', authenticate, authLimiter, validateRequest(changePasswordRules), auth.performPasswordChange)

export default router
