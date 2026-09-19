import mongoose from 'mongoose'

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: String,
  content: { type: String, required: true },
  featuredImage: String,
  category: { type: String, index: true },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: Date,
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft', index: true },
}, { timestamps: true })

newsSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' })
export default mongoose.model('News', newsSchema)
