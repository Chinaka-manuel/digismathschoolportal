import Class from '../models/Class.js'

const allowedSorts = new Set(['createdAt', 'name', 'level', 'isActive'])

export async function listClasses({ page = 1, limit = 20, search = '', level, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.name = { $regex: search.trim(), $options: 'i' }
  if (level) filter.level = level
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Class.find(filter).populate('session', 'name').populate('classTeacher', 'fullName staffId').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Class.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createClass(input) {
  return Class.create({ name: input.name.trim(), level: input.level, session: input.session, classTeacher: input.classTeacher, capacity: input.capacity || 30, isActive: input.isActive ?? true })
}

export async function updateClass(id, input) {
  const item = await Class.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('session', 'name').populate('classTeacher', 'fullName staffId').lean()
  if (!item) { const error = new Error('Class not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteClass(id) {
  const item = await Class.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Class not found'); error.statusCode = 404; throw error }
}
