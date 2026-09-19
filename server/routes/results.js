import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { getStudentResults, publishResult } from '../services/resultService.js'
import Student from '../models/Student.js'
import Result from '../models/Result.js'

const router = Router()
const publishers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/student/:studentId', authenticate, async (req, res, next) => { try { res.json({ success: true, message: 'Results retrieved successfully', data: await getStudentResults({ studentId: req.params.studentId, user: req.user }) }) } catch (error) { next(error) } })
router.get('/me', authenticate, async (req, res, next) => { try { const students = await Student.find({ $or: [{ user: req.user.sub }, { guardian: req.user.sub }] }).select('_id').lean(); const results = await Result.find({ student: { $in: students.map((s) => s._id) } }).populate('student', 'studentId fullName').populate('session', 'name').populate('term', 'name').sort({ createdAt: -1 }).lean(); res.json({ success: true, message: 'Your results retrieved successfully', data: results }) } catch (error) { next(error) } })
router.patch('/:resultId/publish', authenticate, authorize(...publishers), async (req, res, next) => { try { res.json({ success: true, message: 'Result published successfully', data: await publishResult(req.params.resultId) }) } catch (error) { next(error) } })

export default router
