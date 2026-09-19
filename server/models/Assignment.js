import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: String,
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
  term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true, index: true },
  dueDate: Date,
  attachmentUrl: String,
  attachmentPublicId: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false, index: true },
}, { timestamps: true })

export default mongoose.model('Assignment', assignmentSchema)
