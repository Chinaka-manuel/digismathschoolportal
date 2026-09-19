import AuditLog from '../models/AuditLog.js'
import { logger } from '../utils/logger.js'

/**
 * Records a sensitive action (spec section 48).
 *
 * Accepts either a request (route handlers) or explicit user/role fields
 * (background work and webhooks, where there is no authenticated request).
 * Writing an audit row must never break the action being audited, so failures
 * are logged rather than thrown.
 */
export async function recordAudit({ req, userId, role, action, resource, resourceId, metadata, ipAddress, userAgent }) {
  try {
    return await AuditLog.create({
      user: userId ?? req?.user?.sub,
      role: role ?? req?.user?.role,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      metadata,
      ipAddress: ipAddress ?? req?.ip,
      userAgent: userAgent ?? req?.get?.('user-agent'),
    })
  } catch (error) {
    logger.error('Failed to write audit log', { action, resource, message: error.message })
    return null
  }
}
