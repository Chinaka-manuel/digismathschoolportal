import Staff from '../models/Staff.js'

export async function listStaff({ page = 1, limit = 20, search = '', status }) {
  const safePage = Math.max(Number(page) || 1, 1); const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}; if (status) filter.status = status; if (search) filter.$or = [{ fullName: { $regex: search.trim(), $options: 'i' } }, { staffId: { $regex: search.trim(), $options: 'i' } }, { position: { $regex: search.trim(), $options: 'i' } }]
  const [data, total] = await Promise.all([Staff.find(filter).populate('user', 'email role').sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(), Staff.countDocuments(filter)])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}
export async function createStaff(input) { return Staff.create({ staffId: input.staffId.trim(), user: input.user, fullName: input.fullName.trim(), phone: input.phone, department: input.department, position: input.position, qualifications: input.qualifications || [], subjects: input.subjects || [], classes: input.classes || [], employmentDate: input.employmentDate, status: input.status || 'active' }) }
export async function updateStaff(id, input) { const item = await Staff.findByIdAndUpdate(id, input, { new: true, runValidators: true }).populate('user', 'email role').lean(); if (!item) { const error = new Error('Staff member not found'); error.statusCode = 404; throw error }; return item }
