import Student from '../models/Student.js'
import User from '../models/User.js'

export async function linkChild(parentId, childId) {
  const student = await Student.findById(childId)
  if (!student) { const error = new Error('Student not found'); error.statusCode = 404; throw error }
  const parent = await User.findById(parentId)
  if (!parent || !['PARENT', 'GUARDIAN'].includes(parent.role)) { const error = new Error('User is not a parent or guardian'); error.statusCode = 422; throw error }
  student.guardian = parentId
  await student.save()
  return student
}

export async function unlinkChild(parentId, childId) {
  const student = await Student.findOne({ _id: childId, guardian: parentId })
  if (!student) { const error = new Error('Student not found or not linked to this parent'); error.statusCode = 404; throw error }
  student.guardian = undefined
  await student.save()
  return student
}

export async function listChildren(parentId) {
  return Student.find({ guardian: parentId }).select('studentId admissionNumber fullName photoUrl classRef session status').populate('classRef', 'name').lean()
}
