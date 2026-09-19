import Term from '../models/Term.js'

const allowedSorts = new Set(['createdAt', 'name', 'isActive'])

export async function listTerms({ page = 1, limit = 20, search = '', session, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.name = { $regex: search.trim(), $options: 'i' }
  if (session) filter.session = session
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Term.find(filter).populate('session', 'name').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Term.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createTerm(input) {
  return Term.create({ name: input.name.trim(), session: input.session, startDate: input.startDate, endDate: input.endDate, isActive: input.isActive ?? false })
}

export async function updateTerm(id, input) {
  const item = await Term.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('session', 'name').lean()
  if (!item) { const error = new Error('Term not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteTerm(id) {
  const item = await Term.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Term not found'); error.statusCode = 404; throw error }
}
