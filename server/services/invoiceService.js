import Invoice from '../models/Invoice.js'
import Payment from '../models/Payment.js'
import mongoose from 'mongoose'

const allowedSorts = new Set(['createdAt', 'invoiceNumber', 'amount', 'status'])

export async function listInvoices({ page = 1, limit = 20, search = '', studentId, status, sort = 'createdAt' }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.invoiceNumber = { $regex: search.trim(), $options: 'i' }
  if (studentId) filter.student = studentId
  if (status) filter.status = status
  const sortField = allowedSorts.has(sort) ? sort : 'createdAt'
  const [data, total] = await Promise.all([
    Invoice.find(filter).populate('student', 'studentId fullName').populate('user', 'name email').sort({ [sortField]: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Invoice.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function createInvoice(input) {
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
  return Invoice.create({ invoiceNumber, student: input.student, user: input.user, fee: input.fee, amount: Number(input.amount), currency: input.currency || 'NGN', status: input.status || 'pending', dueDate: input.dueDate, notes: input.notes })
}

export async function updateInvoice(id, input) {
  const item = await Invoice.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('student', 'studentId fullName').populate('user', 'name email').lean()
  if (!item) { const error = new Error('Invoice not found'); error.statusCode = 404; throw error }
  return item
}

export async function deleteInvoice(id) {
  const item = await Invoice.findByIdAndDelete(id).lean()
  if (!item) { const error = new Error('Invoice not found'); error.statusCode = 404; throw error }
}
