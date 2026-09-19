import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate, authorize } from '../middleware/auth.js'
import { listAdmissions, submitApplication, updateAdmissionStatus } from '../services/admissionService.js'

const router = Router()
const publicLimit = rateLimit({ windowMs: 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false })
const reviewers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMISSION_OFFICER']

router.post('/', publicLimit, async (req, res, next) => {
  try {
    const { applicantName, email, requestedClass } = req.body
    const errors = []
    if (!applicantName || applicantName.trim().length < 2) errors.push({ field: 'applicantName', message: 'Applicant name is required' })
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push({ field: 'email', message: 'A valid email is required' })
    if (!requestedClass || requestedClass.trim().length < 2) errors.push({ field: 'requestedClass', message: 'Requested class is required' })
    if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors })
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: await submitApplication(req.body) })
  } catch (error) { next(error) }
})

router.get('/', authenticate, authorize(...reviewers), async (req, res, next) => { try { res.json({ success: true, message: 'Admissions retrieved successfully', ...(await listAdmissions(req.query)) }) } catch (error) { next(error) } })
router.patch('/:id/status', authenticate, authorize(...reviewers), async (req, res, next) => { try { res.json({ success: true, message: 'Admission status updated', data: await updateAdmissionStatus(req.params.id, req.body.status) }) } catch (error) { next(error) } })

export default router
