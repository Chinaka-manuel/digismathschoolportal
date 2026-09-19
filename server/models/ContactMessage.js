import mongoose from 'mongoose'

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: String,
  subject: { type: String, maxlength: 160 },
  message: { type: String, required: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new', index: true },
}, { timestamps: true })

contactMessageSchema.index({ createdAt: -1 })
export default mongoose.model('ContactMessage', contactMessageSchema)
