import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()
router.get('/', (req, res) => { const database = mongoose.connection.readyState === 1 ? 'connected' : 'not-configured'; res.json({ success: true, message: 'Northbridge API is healthy', data: { service: 'school-management-api', status: 'ok', database, timestamp: new Date().toISOString() } }) })
export default router
