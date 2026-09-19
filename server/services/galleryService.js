import Gallery from '../models/Gallery.js'

const allowedSorts = new Set(['createdAt', 'title', 'kind', 'isPublished'])

export async function listGallery({ page = 1, limit = 20, search = '', category, kind, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.title = { $regex: search.trim(), $options: 'i' }
  if (category) filter.category = category
  if (kind) filter.kind = kind
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Gallery.find(filter).sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Gallery.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createGalleryItem(input) {
  return Gallery.create({ title: input.title, mediaUrl: input.mediaUrl, mediaPublicId: input.mediaPublicId, kind: input.kind, category: input.category, isPublished: input.isPublished ?? false })
}

export async function updateGalleryItem(id, input) {
  const item = await Gallery.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean()
  if (!item) { const error = new Error('Gallery item not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteGalleryItem(id) {
  const item = await Gallery.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Gallery item not found'); error.statusCode = 404; throw error }
}
