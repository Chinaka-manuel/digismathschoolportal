import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { emailService } from './emailService.js'
import { HttpError } from '../utils/apiResponse.js'
import { logger } from '../utils/logger.js'

const accessTtl = '15m'
const refreshTtl = '7d'

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, profileImageUrl: user.profileImageUrl, permissions: user.permissions, isActive: user.isActive }
}

function signTokens(user) {
  const payload = { sub: String(user._id), role: user.role, permissions: user.permissions }
  return { accessToken: jwt.sign(payload, env.accessSecret, { expiresIn: accessTtl }), refreshToken: jwt.sign(payload, env.refreshSecret, { expiresIn: refreshTtl }) }
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email })
  if (existing) { const error = new Error('An account with this email already exists'); error.statusCode = 409; throw error }
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash, role: 'PARENT' })
  return createSession(user)
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash')
  if (!user || !user.isActive) { const error = new Error('Invalid email or password'); error.statusCode = 401; throw error }
  if (user.lockedUntil && user.lockedUntil > new Date()) { const error = new Error('Account temporarily locked. Try again later'); error.statusCode = 423; throw error }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    user.failedLoginAttempts += 1
    if (user.failedLoginAttempts >= 5) user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()
    const error = new Error('Invalid email or password'); error.statusCode = 401; throw error
  }
  user.failedLoginAttempts = 0
  user.lockedUntil = undefined
  return createSession(user)
}

export async function createSession(user) {
  const tokens = signTokens(user)
  user.refreshTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')
  await user.save()
  return { ...tokens, user: publicUser(user) }
}

export async function rotateRefreshToken(token) {
  const payload = jwt.verify(token, env.refreshSecret)
  const user = await User.findById(payload.sub).select('+refreshTokenHash')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hash) { const error = new Error('Refresh session is no longer valid'); error.statusCode = 401; throw error }
  return createSession(user)
}

export async function clearSession(userId) { await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } }) }
export { publicUser }


/* ------------------------------------------------------------------ *
 * Password lifecycle (spec section 6)
 * ------------------------------------------------------------------ */

const RESET_TTL_MS = 30 * 60 * 1000

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

/**
 * Always resolves, whether or not the address exists. Returning "no such user"
 * would turn this endpoint into an account-enumeration oracle.
 */
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (!user || !user.isActive) {
    logger.info('Password reset requested for unknown or inactive account')
    return { sent: true }
  }

  const token = crypto.randomBytes(32).toString('hex')
  user.passwordResetTokenHash = hashToken(token)
  user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MS)
  await user.save()

  const resetLink = `${env.clientUrl}/reset-password?token=${token}`
  await emailService.sendTemplate('passwordReset', user.email, user.name, resetLink)
  return { sent: true }
}

export async function resetPassword({ token, password }) {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(String(token)),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires +passwordHash')

  if (!user) throw new HttpError('This reset link is invalid or has expired', 400)

  user.passwordHash = await bcrypt.hash(password, 12)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpires = undefined
  user.passwordChangedAt = new Date()
  user.failedLoginAttempts = 0
  user.lockedUntil = undefined
  // Invalidate every existing session: a reset means the old one may be compromised.
  user.refreshTokenHash = undefined
  await user.save()

  await emailService.sendTemplate('passwordChanged', user.email, user.name)
  return createSession(user)
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash +refreshTokenHash')
  if (!user) throw new HttpError('Account not found', 404)

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw new HttpError('Your current password is incorrect', 401)
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw new HttpError('Choose a password you have not used before', 422)
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.passwordChangedAt = new Date()
  await user.save()

  await emailService.sendTemplate('passwordChanged', user.email, user.name)
  // Issues a fresh session so the caller is not logged out by their own change.
  return createSession(user)
}

/** Full profile for GET /auth/me, without any sensitive field. */
export async function getCurrentUser(userId) {
  const user = await User.findById(userId).lean()
  if (!user || !user.isActive) throw new HttpError('Account not found', 404)
  return {
    id: user._id, name: user.name, email: user.email, role: user.role,
    profileImageUrl: user.profileImageUrl, permissions: user.permissions, isActive: user.isActive,
  }
}
