import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
  term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true, index: true },
  subjects: [{ subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, ca: { type: Number, min: 0 }, exam: { type: Number, min: 0 }, total: Number, grade: String, remark: String }],
  average: Number,
  attendance: { present: Number, total: Number },
  teacherRemark: String,
  principalRemark: String,
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
}, { timestamps: true })

resultSchema.index({ student: 1, session: 1, term: 1 }, { unique: true })
export default mongoose.model('Result', resultSchema)
