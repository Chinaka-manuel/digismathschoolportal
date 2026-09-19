import mongoose from 'mongoose'

const mediaAssetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['profile_image', 'video', 'document'], required: true, index: true },
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  secureUrl: { type: String, required: true },
  resourceType: { type: String, required: true },
  format: String,
  bytes: Number,
  duration: Number,
  originalName: String,
}, { timestamps: true })

export default mongoose.model('MediaAsset', mediaAssetSchema)
