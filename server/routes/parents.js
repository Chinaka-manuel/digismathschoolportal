import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { linkChild, listChildren, unlinkChild } from '../services/parentService.js'

const router = Router()

router.get('/children', authenticate, authorize('PARENT', 'GUARDIAN'), async (req, res, next) => {
  try {
    const children = await listChildren(req.user.sub)
    res.json({ success: true, message: 'Children retrieved successfully', data: children })
  } catch (error) { next(error) }
})

router.post('/children/:childId/link', authenticate, authorize('PARENT', 'GUARDIAN'), async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Child linked successfully', data: await linkChild(req.user.sub, req.params.childId) })
  } catch (error) { next(error) }
})

router.delete('/children/:childId/unlink', authenticate, authorize('PARENT', 'GUARDIAN'), async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Child unlinked successfully', data: await unlinkChild(req.user.sub, req.params.childId) })
  } catch (error) { next(error) }
})

export default router
