import Subject from '../models/Subject.js'

const allowedSorts = new Set(['createdAt', 'name', 'code', 'isActive'])

export async function listSubjects({ page = 1, limit = 20, search = '', department, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.$or = [{ name: { $regex: search.trim(), $options: 'i' } }, { code: { $regex: search.trim(), $options: 'i' } }]
  if (department) filter.department = department
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Subject.find(filter).populate('department', 'name').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Subject.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createSubject(input) {
  return Subject.create({ name: input.name.trim(), code: input.code.trim().toUpperCase(), description: input.description, department: input.department, isActive: input.isActive ?? true })
}

export async function updateSubject(id, input) {
  const item = await Subject.findByIdAndUpdate(id, { ...input, ...(input.code ? { code: input.code.trim().toUpperCase() } : {}) }, { new: true, runValidators: true }).populate('department', 'name').lean()
  if (!item) { const error = new Error('Subject not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteSubject(id) {
  const item = await Subject.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Subject not found'); error.statusCode = 404; throw error }
}
