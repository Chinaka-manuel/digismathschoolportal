import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { getPublicStats, getAdminDashboard, getReportsAnalytics } from '../services/reportService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/public', async (req, res, next) => {
  try {
    const data = await getPublicStats()
    res.json({ success: true, message: 'Public statistics retrieved successfully', data })
  } catch (error) {
    next(error)
  }
})

router.get('/dashboard', authenticate, authorize(...managers), async (req, res, next) => {
  try {
    const data = await getAdminDashboard()
    res.json({ success: true, message: 'Admin dashboard data retrieved successfully', data })
  } catch (error) {
    next(error)
  }
})

router.get('/analytics', authenticate, authorize(...managers), async (req, res, next) => {
  try {
    const data = await getReportsAnalytics()
    res.json({ success: true, message: 'Reports analytics retrieved successfully', data })
  } catch (error) {
    next(error)
  }
})

export default router
