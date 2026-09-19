import rateLimit from 'express-rate-limit'

const envelope = { success: false, message: 'Too many requests. Please slow down and try again shortly.', errors: [] }
const base = { standardHeaders: true, legacyHeaders: false, message: envelope }

/** Per-endpoint budgets (spec section 7). Sensitive routes get the tightest limits. */
export const authLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 10 })
export const registerLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 5 })
export const passwordResetLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 5 })
export const publicLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 100 })
export const contactLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 10 })
export const chatbotLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 20 })
export const paymentLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 20 })
export const uploadLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 30 })
