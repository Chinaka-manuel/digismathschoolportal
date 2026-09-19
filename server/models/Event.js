import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  type: { type: String, enum: ['Academic', 'Examination', 'Holiday', 'Meeting', 'Sports', 'Cultural', 'Admission', 'Other'], required: true, index: true },
  startsAt: { type: Date, required: true, index: true },
  endsAt: Date,
  location: String,
  isPublished: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('Event', eventSchema)
