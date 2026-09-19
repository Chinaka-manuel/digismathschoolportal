import crypto from 'node:crypto'
import Admission from '../models/Admission.js'

const allowedStatuses = new Set(['Pending', 'Under Review', 'Approved', 'Rejected', 'Waitlisted'])

function applicationNumber() { return `NB-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}` }

export async function submitApplication(input) {
  const application = await Admission.create({
    applicationNumber: applicationNumber(),
    applicantName: input.applicantName.trim(),
    email: input.email.toLowerCase().trim(),
    requestedClass: input.requestedClass.trim(),
    payload: { ...input, password: undefined, applicationNumber: undefined },
  })
  return { applicationNumber: application.applicationNumber, status: application.status, submittedAt: application.createdAt }
}

export async function listAdmissions({ page = 1, limit = 20, search = '', status }) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const filter = {}
  if (search) filter.$or = [{ applicantName: { $regex: search.trim(), $options: 'i' } }, { applicationNumber: { $regex: search.trim(), $options: 'i' } }, { email: { $regex: search.trim(), $options: 'i' } }]
  if (status && allowedStatuses.has(status)) filter.status = status
  const [data, total] = await Promise.all([
    Admission.find(filter).select('-payload').sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Admission.countDocuments(filter),
  ])
  return { data, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } }
}

export async function updateAdmissionStatus(id, status) {
  if (!allowedStatuses.has(status)) { const error = new Error('Invalid admission status'); error.statusCode = 422; throw error }
  const application = await Admission.findByIdAndUpdate(id, { status }, { new: true }).select('-payload').lean()
  if (!application) { const error = new Error('Admission application not found'); error.statusCode = 404; throw error }
  return application
}
