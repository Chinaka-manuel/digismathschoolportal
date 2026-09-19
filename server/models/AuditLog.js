import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role: String,
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: String,
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

auditLogSchema.index({ createdAt: -1 })
export default mongoose.model('AuditLog', auditLogSchema)
