import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import ContactMessage from '../models/ContactMessage.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const contactLimit = rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false })
router.post('/', contactLimit, async (req, res, next) => { try { const { name, email, message } = req.body; const errors = []; if (!name || name.trim().length < 2) errors.push({ field: 'name', message: 'Name is required' }); if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push({ field: 'email', message: 'A valid email is required' }); if (!message || message.trim().length < 10) errors.push({ field: 'message', message: 'Message must be at least 10 characters' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await ContactMessage.create({ ...req.body, name: name.trim(), email: email.toLowerCase().trim(), message: message.trim() }); res.status(201).json({ success: true, message: 'Your message has been received', data: { id: item.id } }) } catch (error) { next(error) } })
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'), async (req, res, next) => { try { const data = await ContactMessage.find().sort({ createdAt: -1 }).limit(100).lean(); res.json({ success: true, message: 'Contact messages retrieved successfully', data }) } catch (error) { next(error) } })
export default router
