import News from '../models/News.js'
import Announcement from '../models/Announcement.js'

function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

export async function listNewsAdmin({ page = 1, limit = 20, status, search = '' }) {
  const safePage = Math.max(Number(page) || 1, 1); const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}; if (status) filter.status = status; if (search) filter.$text = { $search: search.trim() }
  const [data, total] = await Promise.all([News.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(), News.countDocuments(filter)])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createNews(input, author) {
  return News.create({ title: input.title.trim(), slug: input.slug?.trim() || slugify(input.title), excerpt: input.excerpt, content: input.content, featuredImage: input.featuredImage, category: input.category, tags: input.tags || [], author, status: input.status || 'draft', publishedAt: input.status === 'published' ? new Date() : input.publishedAt })
}
export async function updateNews(id, input) { const item = await News.findByIdAndUpdate(id, { ...input, ...(input.title ? { title: input.title.trim() } : {}), ...(input.slug ? { slug: slugify(input.slug) } : {}) }, { new: true, runValidators: true }).lean(); if (!item) { const error = new Error('News article not found'); error.statusCode = 404; throw error }; return item }
export async function deleteNews(id) { const item = await News.findByIdAndDelete(id).lean(); if (!item) { const error = new Error('News article not found'); error.statusCode = 404; throw error } }
export async function listAnnouncements({ page = 1, limit = 20 }) { const safePage = Math.max(Number(page) || 1, 1); const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100); const [data, total] = await Promise.all([Announcement.find().sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(), Announcement.countDocuments()]); return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } } }
export async function createAnnouncement(input, author) { return Announcement.create({ title: input.title.trim(), body: input.body, audience: input.audience || ['ALL'], author, isPublished: Boolean(input.isPublished), publishedAt: input.isPublished ? new Date() : undefined }) }
export async function updateAnnouncement(id, input) { const item = await Announcement.findByIdAndUpdate(id, { ...input, ...(input.isPublished ? { publishedAt: new Date() } : {}) }, { new: true, runValidators: true }).lean(); if (!item) { const error = new Error('Announcement not found'); error.statusCode = 404; throw error }; return item }
