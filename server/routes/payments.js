import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { paymentLimiter } from '../middleware/rateLimiters.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { body } from 'express-validator'
import {
  handleProviderWebhook,
  initiatePayment,
  listPayments,
  reviewManualPayment,
  verifyPaymentByReference,
} from '../services/paymentService.js'
import { supportedProviders } from '../services/paymentProviders.js'
import { recordAudit } from '../services/auditService.js'
import { ok, created, fail } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { logger } from '../utils/logger.js'
import Payment from '../models/Payment.js'

const router = Router()
const paymentManagers = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']

const initiateRules = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than zero'),
  body('method').isIn(supportedProviders).withMessage('Select a supported payment method'),
  body('purpose').trim().isLength({ min: 2, max: 120 }).withMessage('A payment purpose is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('student').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid student reference'),
]

router.post('/', authenticate, paymentLimiter, validateRequest(initiateRules), asyncHandler(async (req, res) => {
  const { payment, checkout } = await initiatePayment({
    userId: req.user.sub,
    student: req.body.student,
    amount: req.body.amount,
    currency: req.body.currency || 'NGN',
    method: req.body.method,
    purpose: req.body.purpose,
    metadata: req.body.metadata,
  })
  await recordAudit({ req, action: 'payment.initiated', resource: 'Payment', resourceId: payment._id, metadata: { method: payment.method, amount: payment.amount } })
  return created(res, {
    message: 'Payment initialised',
    data: {
      reference: payment.reference, status: payment.status, amount: payment.amount,
      currency: payment.currency, provider: payment.provider,
      authorizationUrl: checkout.authorizationUrl || null, manual: Boolean(checkout.manual),
    },
  })
}))

/**
 * Provider webhooks. Unauthenticated by design -- the provider's signature over
 * the raw body is the credential (spec section 68).
 */
router.post('/webhooks/:provider', asyncHandler(async (req, res) => {
  try {
    const result = await handleProviderWebhook(req.params.provider, req)
    return ok(res, {
      message: result.duplicate ? 'Webhook already processed' : 'Webhook processed',
      data: { reference: result.payment.reference, status: result.payment.status },
    })
  } catch (error) {
    logger.warn('Rejected payment webhook', { provider: req.params.provider, message: error.message })
    // Always answer with the generic envelope so probing cannot map internals.
    return fail(res, { message: 'Webhook rejected', status: error.statusCode || 400 })
  }
}))

/** Server-side re-check. The client may ask, but only the provider decides. */
router.post('/:reference/verify', authenticate, paymentLimiter, asyncHandler(async (req, res) => {
  const payment = await verifyPaymentByReference(req.params.reference)
  const owned = String(payment.user) === req.user.sub
  if (!owned && !paymentManagers.includes(req.user.role)) {
    return fail(res, { message: 'You do not have access to this payment', status: 403 })
  }
  return ok(res, { message: 'Payment status refreshed', data: { reference: payment.reference, status: payment.status, amount: payment.amount, currency: payment.currency } })
}))

router.get('/', authenticate, authorize(...paymentManagers), asyncHandler(async (req, res) => {
  const { data, pagination } = await listPayments(req.query)
  return ok(res, { message: 'Payments retrieved', data, pagination })
}))

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const data = await Payment.find({ user: req.user.sub }).sort({ createdAt: -1 }).limit(50).lean()
  return ok(res, { message: 'Your payments retrieved', data })
}))

router.patch('/:reference/review', authenticate, authorize(...paymentManagers), validateRequest([
  body('approve').isBoolean().withMessage('Approve must be true or false'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note is too long'),
]), asyncHandler(async (req, res) => {
  const payment = await reviewManualPayment({
    reference: req.params.reference,
    approve: req.body.approve === true || req.body.approve === 'true',
    reviewerId: req.user.sub,
    note: req.body.note,
  })
  return ok(res, { message: `Payment ${payment.status}`, data: { reference: payment.reference, status: payment.status } })
}))

export default router
