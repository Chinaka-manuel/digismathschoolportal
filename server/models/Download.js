import mongoose from 'mongoose'

const downloadSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: String,
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true, unique: true },
  category: { type: String, index: true },
  mimeType: { type: String, required: true },
  bytes: Number,
  isPublic: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('Download', downloadSchema)
