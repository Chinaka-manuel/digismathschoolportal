import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = Router()
router.get('/', authenticate, async (req, res, next) => { try { const data = await Notification.find({ recipient: req.user.sub }).sort({ createdAt: -1 }).limit(30).lean(); res.json({ success: true, message: 'Notifications retrieved successfully', data }) } catch (error) { next(error) } })
router.patch('/:id/read', authenticate, async (req, res, next) => { try { const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user.sub }, { readAt: new Date() }, { new: true }).lean(); if (!notification) return res.status(404).json({ success: false, message: 'Notification not found', errors: [] }); res.json({ success: true, message: 'Notification marked as read', data: notification }) } catch (error) { next(error) } })
export default router
