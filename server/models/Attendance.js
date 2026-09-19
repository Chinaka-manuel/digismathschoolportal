import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', index: true },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  note: { type: String, maxlength: 500 },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

attendanceSchema.index({ student: 1, date: 1 }, { unique: true })
export default mongoose.model('Attendance', attendanceSchema)
