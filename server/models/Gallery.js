import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  title: { type: String, trim: true, index: true },
  mediaUrl: { type: String, required: true },
  mediaPublicId: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['image', 'video'], required: true, index: true },
  category: { type: String, index: true },
  isPublished: { type: Boolean, default: false, index: true },
}, { timestamps: true })

export default mongoose.model('Gallery', gallerySchema)
