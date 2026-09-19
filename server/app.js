import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import morgan from 'morgan'
import { env } from './config/env.js'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import admissionRoutes from './routes/admissions.js'
import paymentRoutes from './routes/payments.js'
import resultRoutes from './routes/results.js'
import contentRoutes from './routes/content.js'
import chatbotRoutes from './routes/chatbot.js'
import notificationRoutes from './routes/notifications.js'
import cmsRoutes from './routes/cms.js'
import staffRoutes from './routes/staff.js'
import attendanceRoutes from './routes/attendance.js'
import uploadRoutes from './routes/uploads.js'
import verificationRoutes from './routes/verification.js'
import settingsRoutes from './routes/settings.js'
import contactRoutes from './routes/contact.js'
import departmentRoutes from './routes/departments.js'
import subjectRoutes from './routes/subjects.js'
import sessionRoutes from './routes/sessions.js'
import termRoutes from './routes/terms.js'
import galleryRoutes from './routes/gallery.js'
import downloadRoutes from './routes/downloads.js'
import feeRoutes from './routes/fees.js'
import invoiceRoutes from './routes/invoices.js'
import assignmentRoutes from './routes/assignments.js'
import auditLogRoutes from './routes/audit-logs.js'
import userRoutes from './routes/users.js'
import classRoutes from './routes/classes.js'
import parentRoutes from './routes/parents.js'
import reportRoutes from './routes/reports.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { sanitizeInput } from './middleware/sanitizeInput.js'
import { requestLogger } from './middleware/requestLogger.js'
import { authLimiter, chatbotLimiter, contactLimiter, publicLimiter, uploadLimiter } from './middleware/rateLimiters.js'

const app = express()
app.use(helmet())
const allowedOrigins = env.nodeEnv === 'production'
  ? [env.clientUrl, ...env.corsOrigins]
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', env.clientUrl, ...env.corsOrigins]
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), credentials: true }))
app.use(compression())
// Keep the exact bytes of the request so payment webhooks can verify their
// signature. Re-serialising req.body produces different bytes and never matches.
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buffer) => { if (buffer?.length) req.rawBody = buffer.toString('utf8') },
}))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use(requestLogger)
app.use(sanitizeInput)

// Rate limits are scoped per surface rather than applied globally (spec section 7).
app.use('/api/auth', authLimiter)
app.use('/api/v1/contact', contactLimiter)
app.use('/api/v1/chatbot', chatbotLimiter)
app.use('/api/v1/uploads', uploadLimiter)
app.use('/api/v1/content', publicLimiter)
app.use('/api/v1/verify', publicLimiter)
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/v1/students', studentRoutes)
app.use('/api/v1/admissions', admissionRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/results', resultRoutes)
app.use('/api/v1/content', contentRoutes)
app.use('/api/v1/chatbot', chatbotRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/cms', cmsRoutes)
app.use('/api/v1/staff', staffRoutes)
app.use('/api/v1/attendance', attendanceRoutes)
app.use('/api/v1/uploads', uploadRoutes)
app.use('/api/v1/verify', verificationRoutes)
app.use('/api/v1/settings', settingsRoutes)
app.use('/api/v1/contact', contactRoutes)
app.use('/api/v1/departments', departmentRoutes)
app.use('/api/v1/subjects', subjectRoutes)
app.use('/api/v1/sessions', sessionRoutes)
app.use('/api/v1/terms', termRoutes)
app.use('/api/v1/gallery', galleryRoutes)
app.use('/api/v1/downloads', downloadRoutes)
app.use('/api/v1/fees', feeRoutes)
app.use('/api/v1/invoices', invoiceRoutes)
app.use('/api/v1/assignments', assignmentRoutes)
app.use('/api/v1/audit-logs', auditLogRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/classes', classRoutes)
app.use('/api/v1/parents', parentRoutes)
app.use('/api/v1/reports', reportRoutes)
app.get('/api/v1', (req, res) => res.json({ success: true, message: 'Northbridge School Management API', data: { version: '1.0.0' } }))
app.use(notFound)
app.use(errorHandler)
export default app
