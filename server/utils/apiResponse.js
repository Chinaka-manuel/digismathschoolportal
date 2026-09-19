/**
 * The single place the API response envelope is defined (spec section 39).
 * Every controller returns through these helpers so clients can rely on the shape.
 */
export function ok(res, { message = 'Request successful', data = null, pagination, status = 200 } = {}) {
  const body = { success: true, message, data }
  if (pagination) body.pagination = pagination
  return res.status(status).json(body)
}

export function created(res, { message = 'Created successfully', data = null } = {}) {
  return ok(res, { message, data, status: 201 })
}

export function fail(res, { message = 'Request failed', errors = [], status = 400 } = {}) {
  return res.status(status).json({ success: false, message, errors })
}

/** Throwable error that carries an HTTP status through to the central error handler. */
export class HttpError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
  }
}
