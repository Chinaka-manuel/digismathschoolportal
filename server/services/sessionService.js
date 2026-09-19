import AcademicSession from '../models/AcademicSession.js'

const allowedSorts = new Set(['createdAt', 'name', 'startYear', 'isActive'])

export async function listSessions({ page = 1, limit = 20, search = '', sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.name = { $regex: search.trim(), $options: 'i' }
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    AcademicSession.find(filter).sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    AcademicSession.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createSession(input) {
  return AcademicSession.create({ name: input.name.trim(), startYear: Number(input.startYear), endYear: Number(input.endYear), isActive: input.isActive ?? false })
}

export async function updateSession(id, input) {
  const item = await AcademicSession.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean()
  if (!item) { const error = new Error('Academic session not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteSession(id) {
  const item = await AcademicSession.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Academic session not found'); error.statusCode = 404; throw error }
}
