import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import User from '../models/User.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN']

router.get('/', authenticate, authorize(...managers), async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
    const filter = {}
    if (req.query.search) filter.$or = [{ name: { $regex: req.query.search.trim(), $options: 'i' } }, { email: { $regex: req.query.search.trim(), $options: 'i' } }]
    if (req.query.role) filter.role = req.query.role
    const [data, total] = await Promise.all([
      User.find(filter).select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ])
    res.json({ success: true, message: 'Users retrieved successfully', data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

router.patch('/:id/role', authenticate, authorize(...managers), async (req, res, next) => {
  try {
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'ADMISSION_OFFICER']
    if (!allowed.includes(req.body.role)) return res.status(422).json({ success: false, message: 'Invalid role', errors: [] })
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-passwordHash -refreshTokenHash').lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found', errors: [] })
    res.json({ success: true, message: 'User role updated successfully', data: user })
  } catch (error) { next(error) }
})

router.patch('/:id/status', authenticate, authorize(...managers), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-passwordHash -refreshTokenHash').lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found', errors: [] })
    res.json({ success: true, message: 'User status updated successfully', data: user })
  } catch (error) { next(error) }
})

export default router
