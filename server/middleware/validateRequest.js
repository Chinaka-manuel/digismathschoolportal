import { validationResult } from 'express-validator'

/**
 * Runs a list of express-validator chains and stops the request with a 422 that
 * matches the standard error envelope (spec sections 37 and 39).
 */
export function validateRequest(chains = []) {
  return async (req, res, next) => {
    for (const chain of chains) await chain.run(req)
    const result = validationResult(req)
    if (result.isEmpty()) return next()
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map((error) => ({ field: error.path || error.param, message: error.msg })),
    })
  }
}
