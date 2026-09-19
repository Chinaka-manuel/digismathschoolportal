import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  isActive: { type: Boolean, default: false, index: true },
}, { timestamps: true })

sessionSchema.index({ startYear: 1, endYear: 1 }, { unique: true })
export default mongoose.model('AcademicSession', sessionSchema)
