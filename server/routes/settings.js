import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { getPublicSettings, updateSettings } from '../services/settingsService.js'

const router = Router()
router.get('/public', async (req, res, next) => { try { res.json({ success: true, message: 'School settings retrieved successfully', data: await getPublicSettings() }) } catch (error) { next(error) } })
router.patch('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { res.json({ success: true, message: 'School settings updated successfully', data: await updateSettings(req.body) }) } catch (error) { next(error) } })
export default router
