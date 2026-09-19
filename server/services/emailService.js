import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

/**
 * Email transport abstraction (spec section 50). Adding a provider means adding
 * one entry to `transports`; nothing else in the app changes.
 */
const transports = {
  resend: async ({ to, subject, html, text }) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.email.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.email.from, to, subject, html, text }),
    })
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      const error = new Error(`Email provider responded ${response.status}`)
      error.statusCode = 502
      error.detail = detail.slice(0, 300)
      throw error
    }
  },

  /** Writes the message to the log instead of sending. Used when no key is set. */
  console: async ({ to, subject }) => {
    logger.info('Email suppressed (no provider configured)', { to, subject })
  },
}

export class EmailService {
  constructor(provider = env.email.provider || 'resend') {
    this.provider = transports[provider] ? provider : 'console'
  }

  /**
   * Never throws into the caller's happy path: a failed notification must not
   * roll back the action that triggered it (an approved admission, a payment).
   */
  async send({ to, subject, html, text }) {
    if (!to || !subject) return { sent: false, reason: 'missing recipient or subject' }
    const provider = !env.email.apiKey ? 'console' : this.provider
    try {
      await transports[provider]({ to, subject, html, text })
      return { sent: provider !== 'console', provider }
    } catch (error) {
      logger.error('Email delivery failed', { to, subject, provider, message: error.message, detail: error.detail })
      return { sent: false, provider, error: error.message }
    }
  }

  /** Convenience wrapper: send a named template. */
  async sendTemplate(name, to, ...args) {
    const template = emailTemplates[name]
    if (!template) {
      logger.warn('Unknown email template requested', { name })
      return { sent: false, reason: 'unknown template' }
    }
    return this.send({ to, ...template(...args) })
  }
}

export const emailService = new EmailService()

const layout = (body) => `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#1c2b25;max-width:560px;margin:0 auto;padding:24px">${body}<hr style="border:0;border-top:1px solid #dfe1d4;margin:28px 0" /><p style="font-size:12px;color:#53625a">This message was sent by the school portal. Please do not reply to this address.</p></div>`

export const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to the school portal',
    html: layout(`<p>Dear ${name},</p><p>Your portal account is ready. You can now sign in to view announcements, results and fees.</p>`),
    text: `Dear ${name}, your portal account is ready.`,
  }),
  admissionSubmitted: (name, applicationNumber) => ({
    subject: `Application received - ${applicationNumber}`,
    html: layout(`<p>Dear ${name},</p><p>Your application <strong>${applicationNumber}</strong> has been received. You can track its status in the portal.</p>`),
    text: `Dear ${name}, your application ${applicationNumber} has been received.`,
  }),
  admissionApproved: (name) => ({
    subject: 'Application approved',
    html: layout(`<p>Dear ${name},</p><p>Congratulations. Your application has been approved. Please proceed to enrolment.</p>`),
    text: `Dear ${name}, your application has been approved.`,
  }),
  admissionRejected: (name) => ({
    subject: 'Application update',
    html: layout(`<p>Dear ${name},</p><p>Thank you for your application. After careful review we are unable to offer admission at this time.</p>`),
    text: `Dear ${name}, your application was not successful.`,
  }),
  paymentConfirmation: (name, reference, amount, currency = 'NGN') => ({
    subject: 'Payment confirmation',
    html: layout(`<p>Dear ${name},</p><p>We received your payment of <strong>${currency} ${Number(amount).toLocaleString()}</strong>.</p><p>Reference: <strong>${reference}</strong></p>`),
    text: `Dear ${name}, payment of ${currency} ${amount} confirmed. Reference: ${reference}`,
  }),
  paymentFailed: (name, reference) => ({
    subject: 'Payment could not be completed',
    html: layout(`<p>Dear ${name},</p><p>Your payment with reference <strong>${reference}</strong> was not completed. No money has been taken.</p>`),
    text: `Dear ${name}, payment ${reference} was not completed.`,
  }),
  passwordReset: (name, resetLink) => ({
    subject: 'Reset your password',
    html: layout(`<p>Dear ${name},</p><p>Use the link below to choose a new password. It expires in 30 minutes.</p><p><a href="${resetLink}" style="background:#2f6b55;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;display:inline-block">Reset password</a></p><p style="font-size:13px;color:#53625a">If you did not request this, you can ignore this email.</p>`),
    text: `Dear ${name}, reset your password using this link (valid 30 minutes): ${resetLink}`,
  }),
  passwordChanged: (name) => ({
    subject: 'Your password was changed',
    html: layout(`<p>Dear ${name},</p><p>Your portal password was just changed. If this was not you, contact the school immediately.</p>`),
    text: `Dear ${name}, your portal password was changed.`,
  }),
  resultPublished: (name, term) => ({
    subject: 'Result published',
    html: layout(`<p>Dear ${name},</p><p>Your result for <strong>${term}</strong> is now available in the portal.</p>`),
    text: `Dear ${name}, your ${term} result is published.`,
  }),
}
