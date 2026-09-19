import Fee from '../models/Fee.js'
import mongoose from 'mongoose'

const allowedSorts = new Set(['createdAt', 'name', 'amount', 'isActive'])

export async function listFees({ page = 1, limit = 20, search = '', classId, session, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.name = { $regex: search.trim(), $options: 'i' }
  if (classId) filter.classRef = classId
  if (session) filter.session = session
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Fee.find(filter).populate('classRef', 'name').populate('session', 'name').populate('term', 'name').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Fee.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createFee(input) {
  return Fee.create({ name: input.name.trim(), amount: Number(input.amount), classRef: input.classRef, session: input.session, term: input.term, description: input.description, isActive: input.isActive ?? true })
}

export async function updateFee(id, input) {
  const item = await Fee.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('classRef', 'name').populate('session', 'name').populate('term', 'name').lean()
  if (!item) { const error = new Error('Fee not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteFee(id) {
  const item = await Fee.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Fee not found'); error.statusCode = 404; throw error }
}
