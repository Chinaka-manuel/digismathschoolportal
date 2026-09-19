import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, index: true },
  description: String,
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('Department', departmentSchema)
