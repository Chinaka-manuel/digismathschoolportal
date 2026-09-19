import mongoose from 'mongoose'

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  level: { type: String, enum: ['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'], required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession', index: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  capacity: { type: Number, min: 1, default: 30 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })

classSchema.index({ name: 1, session: 1 }, { unique: true })
export default mongoose.model('Class', classSchema)
