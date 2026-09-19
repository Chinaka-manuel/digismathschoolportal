import mongoose from 'mongoose'

const feeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession', index: true },
  term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', index: true },
  description: String,
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })

feeSchema.index({ classRef: 1, session: 1, term: 1 }, { unique: true, sparse: true })
export default mongoose.model('Fee', feeSchema)
