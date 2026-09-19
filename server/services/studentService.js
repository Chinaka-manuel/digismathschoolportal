import Student from '../models/Student.js'

const allowedSorts = new Set(['createdAt', 'fullName', 'studentId', 'status'])

export async function listStudents({ page = 1, limit = 20, search = '', classId, status, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.$text = { $search: search.trim() }
  if (classId) filter.classRef = classId
  if (status) filter.status = status
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Student.find(filter).select('-__v').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Student.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}
