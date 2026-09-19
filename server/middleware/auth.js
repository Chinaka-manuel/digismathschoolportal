import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required', errors: [] })
  try {
    req.user = jwt.verify(token, env.accessSecret)
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired access token', errors: [] })
  }
}

export function authorize(...roles) {
  return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ success: false, message: 'You do not have permission for this resource', errors: [] })
}
