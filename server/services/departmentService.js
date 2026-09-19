import Department from '../models/Department.js'

const allowedSorts = new Set(['createdAt', 'name', 'isActive'])

export async function listDepartments({ page = 1, limit = 20, search = '', sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.$or = [{ name: { $regex: search.trim(), $options: 'i' } }, { description: { $regex: search.trim(), $options: 'i' } }]
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Department.find(filter).populate('head', 'fullName staffId').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Department.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createDepartment(input) {
  return Department.create({ name: input.name.trim(), description: input.description, head: input.head, isActive: input.isActive ?? true })
}

export async function updateDepartment(id, input) {
  const item = await Department.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('head', 'fullName staffId').lean()
  if (!item) { const error = new Error('Department not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteDepartment(id) {
  const item = await Department.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Department not found'); error.statusCode = 404; throw error }
}
