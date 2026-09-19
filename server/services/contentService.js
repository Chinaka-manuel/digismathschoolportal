import News from '../models/News.js'
import Event from '../models/Event.js'

export async function listPublishedNews({ page = 1, limit = 6, search = '', category }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 50)
  const filter = { status: 'published', publishedAt: { $lte: new Date() } }
  if (search) filter.$text = { $search: search.trim() }
  if (category) filter.category = category
  const [data, total] = await Promise.all([
    News.find(filter).select('title slug excerpt featuredImage category tags publishedAt').sort({ publishedAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    News.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function listUpcomingEvents({ limit = 6, type }) {
  const filter = { isPublished: true, startsAt: { $gte: new Date() } }
  if (type) filter.type = type
  return Event.find(filter).select('title description type startsAt endsAt location').sort({ startsAt: 1 }).limit(Math.min(Number(limit) || 6, 50)).lean()
}
