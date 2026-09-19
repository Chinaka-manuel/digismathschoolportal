import crypto from 'node:crypto'
import Payment from '../models/Payment.js'
import User from '../models/User.js'
import { getProvider, supportedProviders } from './paymentProviders.js'
import { emailService } from './emailService.js'
import { recordAudit } from './auditService.js'
import { HttpError } from '../utils/apiResponse.js'
import { buildPagination, parseQuery, safeRegex } from '../utils/pagination.js'
import { logger } from '../utils/logger.js'

const providers = new Set(supportedProviders)

function newReference() {
  return `NB-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

/**
 * Creates the local pending record first, then asks the provider to initialise.
 * The amount is taken from the server-side record, never from what the browser
 * later claims was paid (spec section 69).
 */
export async function initiatePayment({ userId, student, amount, currency = 'NGN', method, purpose, metadata = {} }) {
  if (!providers.has(method)) throw new HttpError('Unsupported payment provider', 422)
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) throw new HttpError('Payment amount must be greater than zero', 422)

  const reference = newReference()
  const payment = await Payment.create({
    reference, user: userId, student, amount: value, currency,
    method, provider: method, purpose, metadata, status: 'pending',
  })

  const user = await User.findById(userId).lean()
  const provider = getProvider(method)
  try {
    const result = await provider.createPayment({
      amount: value, currency, reference, email: user?.email,
      metadata: { ...metadata, purpose, reference },
    })
    if (result.authorizationUrl) {
      payment.metadata = { ...payment.metadata, authorizationUrl: result.authorizationUrl, accessCode: result.accessCode }
      await payment.save()
    }
    return { payment, checkout: result }
  } catch (error) {
    payment.status = 'failed'
    payment.metadata = { ...payment.metadata, initError: error.message }
    await payment.save()
    throw error
  }
}

/** Backwards-compatible alias for the original export name. */
export const createPendingPayment = async (input) => (await initiatePayment(input)).payment

/**
 * Re-checks a payment directly with the provider. This is the only path allowed
 * to mark a payment successful outside of a verified webhook.
 */
export async function verifyPaymentByReference(reference) {
  const payment = await Payment.findOne({ reference })
  if (!payment) throw new HttpError('Payment reference not found', 404)
  if (payment.status === 'successful') return payment

  const verification = await getProvider(payment.method).verifyPayment(reference)
  if (verification.status === 'successful' && Number(verification.amount) < payment.amount) {
    logger.warn('Provider reported a smaller amount than the invoice', {
      reference, expected: payment.amount, received: verification.amount,
    })
    throw new HttpError('Paid amount does not match the expected amount', 409)
  }

  payment.status = verification.status
  payment.transactionId = verification.transactionId || payment.transactionId
  payment.metadata = { ...payment.metadata, verification: verification.metadata }
  await payment.save()
  await notifyPaymentOutcome(payment)
  return payment
}

/**
 * Handles a provider webhook end to end: signature check, idempotency, status
 * update and notification (spec section 68).
 */
export async function handleProviderWebhook(providerName, req) {
  if (!providers.has(providerName)) throw new HttpError('Unsupported payment provider', 422)
  const parsed = await getProvider(providerName).parseWebhook(req)
  if (!parsed.verified) throw new HttpError('Invalid webhook signature', 401)
  if (!parsed.reference) throw new HttpError('Webhook did not identify a payment', 422)

  // Idempotency: the same provider event must never be applied twice.
  const alreadyApplied = await Payment.findOne({ webhookEventId: parsed.eventId })
  if (alreadyApplied) return { payment: alreadyApplied, duplicate: true }

  const payment = await Payment.findOne({ reference: parsed.reference })
  if (!payment) throw new HttpError('Payment reference not found', 404)

  // A successful payment is terminal; a late "failed" event cannot reverse it.
  if (payment.status === 'successful' && parsed.status !== 'successful') {
    return { payment, duplicate: false }
  }

  payment.status = ['successful', 'failed', 'reversed'].includes(parsed.status) ? parsed.status : 'pending'
  payment.transactionId = parsed.transactionId || payment.transactionId
  payment.webhookEventId = parsed.eventId
  payment.metadata = { ...payment.metadata, webhook: parsed.metadata }
  await payment.save()

  await recordAudit({
    userId: payment.user, role: 'SYSTEM', action: 'payment.webhook',
    resource: 'Payment', resourceId: payment._id,
    metadata: { provider: providerName, status: payment.status, eventId: parsed.eventId },
  }).catch(() => {})

  await notifyPaymentOutcome(payment)
  return { payment, duplicate: false }
}

async function notifyPaymentOutcome(payment) {
  const user = await User.findById(payment.user).lean()
  if (!user?.email) return
  if (payment.status === 'successful') {
    await emailService.sendTemplate('paymentConfirmation', user.email, user.name, payment.reference, payment.amount, payment.currency)
  } else if (payment.status === 'failed') {
    await emailService.sendTemplate('paymentFailed', user.email, user.name, payment.reference)
  }
}

/** Paginated, filterable payment listing for the admin and accountant views. */
export async function listPayments(query = {}) {
  const { page, limit, skip, search, sort } = parseQuery(query)
  const filter = {}
  if (query.status) filter.status = query.status
  if (query.method) filter.method = query.method
  if (query.student) filter.student = query.student
  if (search) {
    const term = safeRegex(search)
    filter.$or = [{ reference: term }, { transactionId: term }, { purpose: term }]
  }

  const [data, total] = await Promise.all([
    Payment.find(filter).sort(sort).skip(skip).limit(limit)
      .populate('user', 'name email')
      .populate('student', 'studentId fullName')
      .lean(),
    Payment.countDocuments(filter),
  ])
  return { data, pagination: buildPagination({ page, limit, total }) }
}

/** Accountant approval path for bank transfers (spec section 30). */
export async function reviewManualPayment({ reference, approve, reviewerId, note }) {
  const payment = await Payment.findOne({ reference })
  if (!payment) throw new HttpError('Payment reference not found', 404)
  if (payment.method !== 'bank_transfer') throw new HttpError('Only bank transfers can be reviewed manually', 422)

  payment.status = approve ? 'successful' : 'failed'
  payment.metadata = { ...payment.metadata, review: { by: reviewerId, note, at: new Date() } }
  await payment.save()

  await recordAudit({
    userId: reviewerId, role: 'ACCOUNTANT',
    action: approve ? 'payment.approved' : 'payment.rejected',
    resource: 'Payment', resourceId: payment._id, metadata: { reference, note },
  }).catch(() => {})

  await notifyPaymentOutcome(payment)
  return payment
}

/**
 * Legacy signature-check kept so existing callers keep working. New code should
 * go through handleProviderWebhook, which uses each provider's own scheme.
 */
export function verifyWebhookSignature(rawPayload, signature) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || ''
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex')
  const provided = Buffer.from(String(signature))
  const expectedBuffer = Buffer.from(expected)
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(provided, expectedBuffer)
}

export async function processWebhook({ provider, eventId, reference, status, transactionId, metadata }) {
  if (!providers.has(provider) || !eventId || !reference) throw new HttpError('Invalid webhook payload', 422)
  const existingEvent = await Payment.findOne({ webhookEventId: eventId })
  if (existingEvent) return { payment: existingEvent, duplicate: true }
  const payment = await Payment.findOne({ reference })
  if (!payment) throw new HttpError('Payment reference not found', 404)
  if (payment.status === 'successful' && status !== 'successful') return { payment, duplicate: false }
  payment.status = ['successful', 'failed', 'reversed'].includes(status) ? status : 'pending'
  payment.transactionId = transactionId || payment.transactionId
  payment.webhookEventId = eventId
  payment.metadata = { ...payment.metadata, webhook: metadata }
  await payment.save()
  return { payment, duplicate: false }
}
