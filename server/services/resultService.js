import Result from '../models/Result.js'
import Student from '../models/Student.js'

const staffRoles = new Set(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF'])

export async function getStudentResults({ studentId, user }) {
  const student = await Student.findById(studentId).select('user guardian').lean()
  if (!student) { const error = new Error('Student not found'); error.statusCode = 404; throw error }
  const isStaff = staffRoles.has(user.role)
  const isOwner = String(student.user) === user.sub || String(student.guardian) === user.sub
  if (!isStaff && !isOwner) { const error = new Error('You do not have access to this student result'); error.statusCode = 403; throw error }
  const filter = { student: studentId }
  if (!isStaff) filter.status = 'published'
  return Result.find(filter).populate('classRef', 'name').populate('term', 'name').populate('session', 'name').populate('subjects.subject', 'name code').sort({ createdAt: -1 }).lean()
}

export async function publishResult(resultId) {
  const result = await Result.findByIdAndUpdate(resultId, { status: 'published' }, { new: true }).lean()
  if (!result) { const error = new Error('Result not found'); error.statusCode = 404; throw error }
  return result
}
