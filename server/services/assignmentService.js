import Assignment from '../models/Assignment.js'

const allowedSorts = new Set(['createdAt', 'title', 'dueDate'])

export async function listAssignments({ page = 1, limit = 20, search = '', classId, subject, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = { isPublished: true }
  if (search) filter.title = { $regex: search.trim(), $options: 'i' }
  if (classId) filter.classRef = classId
  if (subject) filter.subject = subject
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Assignment.find(filter).populate('classRef', 'name').populate('subject', 'name code').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Assignment.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createAssignment(input) {
  return Assignment.create({ title: input.title.trim(), description: input.description, classRef: input.classRef, subject: input.subject, session: input.session, term: input.term, dueDate: input.dueDate, attachmentUrl: input.attachmentUrl, attachmentPublicId: input.attachmentPublicId, createdBy: input.createdBy, isPublished: input.isPublished ?? false })
}

export async function updateAssignment(id, input) {
  const item = await Assignment.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('classRef', 'name').populate('subject', 'name code').lean()
  if (!item) { const error = new Error('Assignment not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteAssignment(id) {
  const item = await Assignment.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Assignment not found'); error.statusCode = 404; throw error }
}
