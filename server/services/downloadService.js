import Download from '../models/Download.js'

const allowedSorts = new Set(['createdAt', 'title', 'category'])

export async function listDownloads({ page = 1, limit = 20, search = '', category, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.title = { $regex: search.trim(), $options: 'i' }
  if (category) filter.category = category
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Download.find(filter).sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Download.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createDownload(input) {
  return Download.create({ title: input.title.trim(), description: input.description, fileUrl: input.fileUrl, filePublicId: input.filePublicId, category: input.category, mimeType: input.mimeType, bytes: input.bytes, isPublic: input.isPublic ?? true })
}

export async function updateDownload(id, input) {
  const item = await Download.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean()
  if (!item) { const error = new Error('Download not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteDownload(id) {
  const item = await Download.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Download not found'); error.statusCode = 404; throw error }
}
