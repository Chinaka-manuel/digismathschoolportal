import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  admissionNumber: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true, index: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['female', 'male', 'other'] },
  photoUrl: String,
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', index: true },
  session: { type: String, index: true },
  guardian: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  enrollmentDate: Date,
  status: { type: String, enum: ['active', 'inactive', 'graduated'], default: 'active', index: true },
}, { timestamps: true })

studentSchema.index({ fullName: 'text', studentId: 'text', admissionNumber: 'text' })
export default mongoose.model('Student', studentSchema)
