import { Router } from 'express'
import { getVerificationProfile } from '../services/studentVerificationService.js'

const router = Router()
router.get('/student/:token', async (req, res, next) => { try { res.json({ success: true, message: 'Student verified', data: await getVerificationProfile(req.params.token) }) } catch (error) { next(error) } })
export default router
