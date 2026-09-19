import mongoose from 'mongoose'

const termSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: false, index: true },
}, { timestamps: true })

termSchema.index({ name: 1, session: 1 }, { unique: true })
export default mongoose.model('Term', termSchema)
