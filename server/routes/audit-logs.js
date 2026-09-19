import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import AuditLog from '../models/AuditLog.js'

const router = Router()
const viewers = ['SUPER_ADMIN', 'ADMIN']

router.get('/', authenticate, authorize(...viewers), async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
    const filter = {}
    if (req.query.resource) filter.resource = req.query.resource
    if (req.query.action) filter.action = req.query.action
    if (req.query.user) filter.user = req.query.user
    const [data, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ])
    res.json({ success: true, message: 'Audit logs retrieved successfully', data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

export default router
