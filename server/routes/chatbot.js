import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { answerQuestion } from '../services/chatbotService.js'

const router = Router()
const chatbotLimit = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false })
router.post('/', chatbotLimit, (req, res) => { const message = typeof req.body.message === 'string' ? req.body.message.trim() : ''; if (!message || message.length > 500) return res.status(422).json({ success: false, message: 'A message between 1 and 500 characters is required', errors: [] }); res.json({ success: true, message: 'Chatbot response generated', data: { answer: answerQuestion(message) } }) })
export default router
