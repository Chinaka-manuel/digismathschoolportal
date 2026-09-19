import crypto from 'node:crypto'
import { env } from '../config/env.js'
import { HttpError } from '../utils/apiResponse.js'
import { logger } from '../utils/logger.js'

/**
 * Provider abstraction for payments (spec section 29).
 *
 * Every provider exposes the same three operations, so business logic never
 * depends on which processor is configured:
 *   createPayment(input)   -> { reference, authorizationUrl?, accessCode? }
 *   verifyPayment(ref)     -> { status, amount, currency, transactionId, paidAt }
 *   parseWebhook(req)      -> { verified, eventId, reference, status, transactionId, metadata }
 *
 * Signatures are always checked against the RAW request body. Re-serialising
 * req.body with JSON.stringify produces different bytes than the provider
 * signed (key order, whitespace, unicode escaping), so it can never verify.
 */

const STATUS = { SUCCESS: 'successful', FAILED: 'failed', PENDING: 'pending' }

/** Constant-time compare that tolerates different lengths instead of throwing. */
function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8')
  const right = Buffer.from(String(b || ''), 'utf8')
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function rawBodyOf(req) {
  // Captured by the express.json verify hook in app.js.
  if (req.rawBody) return req.rawBody
  throw new HttpError('Raw request body unavailable for signature verification', 500)
}

class BaseProvider {
  constructor(name) { this.name = name }
  async createPayment() { throw new HttpError(`${this.name} cannot initialise payments`, 501) }
  async verifyPayment(reference) { return { status: STATUS.PENDING, amount: 0, currency: 'NGN', transactionId: reference, paidAt: null } }
  async parseWebhook() { return { verified: false, eventId: '', reference: '', status: STATUS.PENDING } }
}

export class PaystackProvider extends BaseProvider {
  constructor(secret = env.payments.paystackSecret) {
    super('paystack')
    this.secret = secret
  }

  async createPayment({ amount, currency = 'NGN', email, reference, metadata }) {
    if (!this.secret) throw new HttpError('Paystack is not configured', 503)
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: Math.round(amount * 100), currency, reference, metadata }),
    })
    const data = await response.json()
    if (!data.status) throw new HttpError(data.message || 'Paystack initialisation failed', 502)
    return { reference, authorizationUrl: data.data.authorization_url, accessCode: data.data.access_code }
  }

  async verifyPayment(reference) {
    if (!this.secret) throw new HttpError('Paystack is not configured', 503)
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${this.secret}` },
    })
    const data = await response.json()
    if (!data.status) throw new HttpError(data.message || 'Paystack verification failed', 502)
    const payment = data.data
    return {
      status: payment.status === 'success' ? STATUS.SUCCESS : payment.status === 'failed' ? STATUS.FAILED : STATUS.PENDING,
      amount: payment.amount / 100,
      currency: payment.currency,
      transactionId: String(payment.id),
      paidAt: payment.paid_at ? new Date(payment.paid_at) : null,
      metadata: payment.metadata,
    }
  }

  /** Paystack signs the raw body with HMAC-SHA512 using the secret key. */
  async parseWebhook(req) {
    if (!this.secret) return { verified: false, eventId: '', reference: '', status: STATUS.PENDING }
    const signature = req.headers['x-paystack-signature']
    const expected = crypto.createHmac('sha512', this.secret).update(rawBodyOf(req)).digest('hex')
    if (!safeEqual(signature, expected)) return { verified: false, eventId: '', reference: '', status: STATUS.PENDING }

    const event = req.body || {}
    const data = event.data || {}
    const status = event.event === 'charge.success' ? STATUS.SUCCESS
      : event.event === 'charge.failed' ? STATUS.FAILED
      : STATUS.PENDING
    return {
      verified: true,
      // Paystack does not send a stable event id, so the reference plus event
      // name is the idempotency key.
      eventId: `paystack:${event.event}:${data.reference || data.id || ''}`,
      reference: data.reference || '',
      status,
      transactionId: data.id ? String(data.id) : undefined,
      metadata: data.metadata,
    }
  }
}

export class StripeProvider extends BaseProvider {
  constructor(secret = env.payments.stripeSecret, webhookSecret = env.payments.stripeWebhookSecret) {
    super('stripe')
    this.secret = secret
    this.webhookSecret = webhookSecret
  }

  async createPayment({ amount, currency = 'NGN', reference, metadata = {} }) {
    if (!this.secret) throw new HttpError('Stripe is not configured', 503)
    const form = new URLSearchParams()
    form.set('mode', 'payment')
    form.set('success_url', `${env.clientUrl}/payment/success?ref=${encodeURIComponent(reference)}`)
    form.set('cancel_url', `${env.clientUrl}/payment/cancel?ref=${encodeURIComponent(reference)}`)
    form.set('client_reference_id', reference)
    form.set('line_items[0][quantity]', '1')
    form.set('line_items[0][price_data][currency]', String(currency).toLowerCase())
    form.set('line_items[0][price_data][product_data][name]', metadata.purpose || 'School payment')
    form.set('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)))
    for (const [key, value] of Object.entries(metadata)) form.set(`metadata[${key}]`, String(value))

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const data = await response.json()
    if (data.error) throw new HttpError(data.error.message, 502)
    return { reference, authorizationUrl: data.url, accessCode: data.id }
  }

  async verifyPayment(reference) {
    if (!this.secret) throw new HttpError('Stripe is not configured', 503)
    const query = new URLSearchParams({ 'client_reference_id': reference, limit: '1' })
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions?${query}`, {
      headers: { Authorization: `Bearer ${this.secret}` },
    })
    const data = await response.json()
    if (data.error) throw new HttpError(data.error.message, 502)
    const session = data.data?.[0]
    if (!session) return { status: STATUS.PENDING, amount: 0, currency: 'NGN', transactionId: reference, paidAt: null }
    return {
      status: session.payment_status === 'paid' ? STATUS.SUCCESS : session.status === 'expired' ? STATUS.FAILED : STATUS.PENDING,
      amount: (session.amount_total || 0) / 100,
      currency: String(session.currency || 'ngn').toUpperCase(),
      transactionId: session.payment_intent || session.id,
      paidAt: session.status === 'complete' ? new Date() : null,
      metadata: session.metadata,
    }
  }

  /**
   * Stripe sends `stripe-signature: t=<ts>,v1=<sig>` where sig is
   * HMAC-SHA256 of `<ts>.<rawBody>`. The timestamp is checked against a
   * tolerance window so a captured request cannot be replayed later.
   */
  async parseWebhook(req) {
    const unverified = { verified: false, eventId: '', reference: '', status: STATUS.PENDING }
    if (!this.webhookSecret) return unverified

    const header = req.headers['stripe-signature']
    if (!header) return unverified
    const parts = Object.fromEntries(String(header).split(',').map((part) => part.split('=')))
    const timestamp = Number(parts.t)
    if (!Number.isFinite(timestamp)) return unverified
    if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
      logger.warn('Rejected Stripe webhook outside the replay tolerance window', { timestamp })
      return unverified
    }

    const expected = crypto.createHmac('sha256', this.webhookSecret)
      .update(`${parts.t}.${rawBodyOf(req)}`)
      .digest('hex')
    if (!safeEqual(parts.v1, expected)) return unverified

    const event = req.body || {}
    const object = event.data?.object || {}
    const succeeded = ['checkout.session.completed', 'payment_intent.succeeded'].includes(event.type)
    const failed = ['checkout.session.expired', 'payment_intent.payment_failed'].includes(event.type)
    return {
      verified: true,
      eventId: event.id,
      reference: object.client_reference_id || object.metadata?.reference || object.id || '',
      status: succeeded ? STATUS.SUCCESS : failed ? STATUS.FAILED : STATUS.PENDING,
      transactionId: object.payment_intent || object.id,
      metadata: object.metadata,
    }
  }
}

export class PayPalProvider extends BaseProvider {
  constructor(clientId = env.payments.paypalClientId, secret = env.payments.paypalSecret, webhookId = env.payments.paypalWebhookId) {
    super('paypal')
    this.clientId = clientId
    this.secret = secret
    this.webhookId = webhookId
    this.apiBase = env.nodeEnv === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
  }

  async token() {
    if (!this.clientId || !this.secret) throw new HttpError('PayPal is not configured', 503)
    const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64')
    const response = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    const data = await response.json()
    if (!data.access_token) throw new HttpError('PayPal authentication failed', 502)
    return data.access_token
  }

  async createPayment({ amount, currency = 'USD', reference }) {
    const token = await this.token()
    const response = await fetch(`${this.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) }, custom_id: reference }],
        application_context: {
          return_url: `${env.clientUrl}/payment/success?ref=${encodeURIComponent(reference)}`,
          cancel_url: `${env.clientUrl}/payment/cancel?ref=${encodeURIComponent(reference)}`,
        },
      }),
    })
    const data = await response.json()
    if (!data.id) throw new HttpError(data.message || 'PayPal order creation failed', 502)
    return { reference, authorizationUrl: data.links?.find((link) => link.rel === 'approve')?.href, accessCode: data.id }
  }

  async verifyPayment(reference) {
    const token = await this.token()
    const response = await fetch(`${this.apiBase}/v2/checkout/orders/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    const unit = data.purchase_units?.[0]
    return {
      status: data.status === 'COMPLETED' ? STATUS.SUCCESS : data.status === 'VOIDED' ? STATUS.FAILED : STATUS.PENDING,
      amount: Number(unit?.amount?.value || 0),
      currency: unit?.amount?.currency_code || 'USD',
      transactionId: data.id || reference,
      paidAt: data.status === 'COMPLETED' ? new Date(data.update_time || Date.now()) : null,
    }
  }

  /** PayPal verifies signatures server-side through its own API. */
  async parseWebhook(req) {
    const unverified = { verified: false, eventId: '', reference: '', status: STATUS.PENDING }
    if (!this.webhookId) return unverified
    const token = await this.token()
    const response = await fetch(`${this.apiBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: this.webhookId,
        webhook_event: req.body,
      }),
    })
    const data = await response.json()
    if (data.verification_status !== 'SUCCESS') return unverified

    const event = req.body || {}
    const resource = event.resource || {}
    const succeeded = ['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED'].includes(event.event_type)
    const failed = ['PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REVERSED'].includes(event.event_type)
    return {
      verified: true,
      eventId: event.id,
      reference: resource.custom_id || resource.invoice_id || '',
      status: succeeded ? STATUS.SUCCESS : failed ? STATUS.FAILED : STATUS.PENDING,
      transactionId: resource.id,
      metadata: { eventType: event.event_type },
    }
  }
}

/**
 * Bank transfer has no external API: the payment stays pending until an
 * accountant approves the submitted evidence (spec section 30).
 */
export class BankTransferProvider extends BaseProvider {
  constructor() { super('bank_transfer') }

  async createPayment({ reference }) {
    return { reference, authorizationUrl: null, accessCode: null, manual: true }
  }

  async verifyPayment(reference) {
    return { status: STATUS.PENDING, amount: 0, currency: 'NGN', transactionId: reference, paidAt: null }
  }

  async parseWebhook() {
    return { verified: false, eventId: '', reference: '', status: STATUS.PENDING }
  }
}

const registry = {
  paystack: PaystackProvider,
  stripe: StripeProvider,
  paypal: PayPalProvider,
  bank_transfer: BankTransferProvider,
}

export const supportedProviders = Object.keys(registry)

export function getProvider(method) {
  const Provider = registry[method]
  if (!Provider) throw new HttpError(`Unsupported payment provider: ${method}`, 422)
  return new Provider()
}

export { STATUS as PaymentStatus }
