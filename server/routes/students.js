import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { listStudents } from '../services/studentService.js'
import Student from '../models/Student.js'
import { createVerificationToken } from '../services/studentVerificationService.js'

const router = Router()
const staffRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF']

router.get('/me', authenticate, async (req, res, next) => { try { const students = await Student.find({ $or: [{ user: req.user.sub }, { guardian: req.user.sub }] }).select('studentId admissionNumber fullName photoUrl classRef session status').populate('classRef', 'name').lean(); res.json({ success: true, message: 'Owned students retrieved successfully', data: students.map((student) => ({ ...student, verificationToken: createVerificationToken(student._id) })) }) } catch (error) { next(error) } })

router.get('/', authenticate, authorize(...staffRoles), async (req, res, next) => {
  try {
    const result = await listStudents(req.query)
    res.json({ success: true, message: 'Students retrieved successfully', ...result })
  } catch (error) { next(error) }
})

export default router
