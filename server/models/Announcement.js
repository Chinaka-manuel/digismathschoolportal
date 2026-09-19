import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audience: [{ type: String, enum: ['ALL', 'STUDENT', 'PARENT', 'STAFF'] }],
  publishedAt: Date,
  isPublished: { type: Boolean, default: false, index: true },
}, { timestamps: true })

announcementSchema.index({ createdAt: -1 })
export default mongoose.model('Announcement', announcementSchema)
