import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { attendanceSummary, recordAttendance, listAttendance } from '../services/attendanceService.js'
import Attendance from '../models/Attendance.js'

const router = Router()
const recorders = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF']
router.get('/summary', authenticate, authorize(...recorders), async (req, res, next) => { try { res.json({ success: true, message: 'Attendance summary retrieved successfully', data: await attendanceSummary() }) } catch (error) { next(error) } })
router.get('/today', authenticate, authorize(...recorders), async (req, res, next) => { try { const today = new Date(); const data = await Attendance.find({ date: new Date(today.toISOString().slice(0, 10)) }).populate('student', 'studentId fullName').populate('recordedBy', 'name').lean(); res.json({ success: true, message: "Today's attendance retrieved successfully", data }) } catch (error) { next(error) } })
router.get('/student/:studentId', authenticate, async (req, res, next) => { try { res.json({ success: true, message: 'Attendance retrieved successfully', data: await listAttendance({ studentId: req.params.studentId, ...req.query, user: req.user }) }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...recorders), async (req, res, next) => { try { const { student, status } = req.body; if (!student || !['present', 'absent', 'late', 'excused'].includes(status)) return res.status(422).json({ success: false, message: 'Student and valid attendance status are required', errors: [] }); res.json({ success: true, message: 'Attendance recorded successfully', data: await recordAttendance(req.body, req.user.sub) }) } catch (error) { next(error) } })
export default router
