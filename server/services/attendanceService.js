import Attendance from '../models/Attendance.js'
import Student from '../models/Student.js'

const staffRoles = new Set(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF'])

export async function recordAttendance(input, userId) {
  const date = new Date(input.date)
  if (Number.isNaN(date.getTime())) { const error = new Error('A valid attendance date is required'); error.statusCode = 422; throw error }
  const item = await Attendance.findOneAndUpdate({ student: input.student, date: new Date(date.toISOString().slice(0, 10)) }, { ...input, date: new Date(date.toISOString().slice(0, 10)), recordedBy: userId }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean()
  return item
}

export async function listAttendance({ studentId, from, to, user }) {
  const student = await Student.findById(studentId).select('user guardian').lean()
  if (!student) { const error = new Error('Student not found'); error.statusCode = 404; throw error }
  if (!staffRoles.has(user.role) && String(student.user) !== user.sub && String(student.guardian) !== user.sub) { const error = new Error('You do not have access to this attendance record'); error.statusCode = 403; throw error }
  const filter = { student: studentId }
  if (from || to) filter.date = {}; if (from) filter.date.$gte = new Date(from); if (to) filter.date.$lte = new Date(to)
  return Attendance.find(filter).sort({ date: -1 }).limit(366).lean()
}

export async function attendanceSummary() {
  const rows = await Attendance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  return rows.reduce((summary, row) => ({ ...summary, [row._id]: row.count }), { present: 0, absent: 0, late: 0, excused: 0 })
}
