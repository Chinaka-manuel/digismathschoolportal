import { logger } from '../utils/logger.js'

/** Structured access log with duration, kept separate from morgan's dev output. */
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint()
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'debug'
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      ms: Math.round(ms),
      ip: req.ip,
      userId: req.user?.sub,
    })
  })
  next()
}
