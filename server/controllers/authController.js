import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import {
  changePassword,
  clearSession,
  getCurrentUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  rotateRefreshToken,
} from '../services/authService.js'
import { recordAudit } from '../services/auditService.js'
import { ok, created } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Thin controllers (spec section 71): parse the request, call a service, shape
 * the response. No business rules live here.
 */

// SameSite=Lax drops the cookie when the client is served from a different site
// than the API (Vercel front end -> Render API), so cross-site deploys need None.
const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSecure ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
}

function sendSession(res, session, message, status = 200) {
  res.cookie('refreshToken', session.refreshToken, cookieOptions)
  const body = { message, data: { accessToken: session.accessToken, user: session.user } }
  return status === 201 ? created(res, body) : ok(res, body)
}

export const register = asyncHandler(async (req, res) => {
  const session = await registerUser({
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase().trim(),
    password: req.body.password,
  })
  await recordAudit({ req, userId: session.user.id, role: session.user.role, action: 'auth.register', resource: 'User', resourceId: session.user.id })
  return sendSession(res, session, 'Account created successfully', 201)
})

export const login = asyncHandler(async (req, res) => {
  const session = await loginUser({
    email: req.body.email.toLowerCase().trim(),
    password: req.body.password,
  })
  await recordAudit({ req, userId: session.user.id, role: session.user.role, action: 'auth.login', resource: 'User', resourceId: session.user.id })
  return sendSession(res, session, 'Welcome back')
})

export const refresh = asyncHandler(async (req, res) => {
  if (!req.cookies.refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh session required', errors: [] })
  }
  const session = await rotateRefreshToken(req.cookies.refreshToken)
  return sendSession(res, session, 'Session refreshed')
})

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken
  if (token) {
    const payload = jwt.decode(token)
    if (payload?.sub) await clearSession(payload.sub)
  }
  res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined })
  return ok(res, { message: 'Logged out successfully', data: null })
})

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.sub)
  return ok(res, { message: 'Authenticated user', data: { user } })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  await requestPasswordReset(req.body.email)
  // Deliberately identical whether or not the address exists.
  return ok(res, { message: 'If that email is registered, a reset link is on its way.', data: null })
})

export const performPasswordReset = asyncHandler(async (req, res) => {
  const session = await resetPassword({ token: req.body.token, password: req.body.password })
  await recordAudit({ req, userId: session.user.id, role: session.user.role, action: 'auth.password_reset', resource: 'User', resourceId: session.user.id })
  return sendSession(res, session, 'Password updated. You are now signed in.')
})

export const performPasswordChange = asyncHandler(async (req, res) => {
  const session = await changePassword({
    userId: req.user.sub,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  })
  await recordAudit({ req, action: 'auth.password_changed', resource: 'User', resourceId: req.user.sub })
  return sendSession(res, session, 'Password changed successfully')
})
