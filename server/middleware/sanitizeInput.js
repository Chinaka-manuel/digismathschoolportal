import { sanitizeMongo } from '../utils/sanitize.js'

/**
 * Strips Mongo operators from anything a client sends. req.query is a getter on
 * Express 5, so it is redefined rather than mutated in place.
 */
export function sanitizeInput(req, res, next) {
  if (req.body) req.body = sanitizeMongo(req.body)
  if (req.params) req.params = sanitizeMongo(req.params)
  if (req.query && Object.keys(req.query).length) {
    const cleaned = sanitizeMongo({ ...req.query })
    Object.defineProperty(req, 'query', { value: cleaned, writable: true, configurable: true })
  }
  next()
}
