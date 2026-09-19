import mongoose from 'mongoose'

const staffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true, index: true },
  phone: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  position: String,
  qualifications: [String],
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  employmentDate: Date,
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
}, { timestamps: true })

export default mongoose.model('Staff', staffSchema)
