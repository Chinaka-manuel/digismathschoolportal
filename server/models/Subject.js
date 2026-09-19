import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  code: { type: String, required: true, uppercase: true, trim: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  description: String,
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })

subjectSchema.index({ name: 1, code: 1 }, { unique: true })
export default mongoose.model('Subject', subjectSchema)
