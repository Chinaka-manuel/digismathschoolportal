import mongoose from 'mongoose'

const schoolSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'school' },
  schoolName: { type: String, default: 'Northbridge International School' },
  logoUrl: String,
  address: String,
  phone: String,
  email: String,
  whatsappNumber: String,
  whatsappDefaultMessage: String,
  socialLinks: { facebook: String, instagram: String, tiktok: String, twitter: String, youtube: String, linkedin: String },
  description: String,
  mission: String,
  vision: String,
  academicPrograms: [{ name: String, ages: String, description: String }],
  bankDetails: { bankName: String, accountName: String, accountNumber: String, instructions: String },
}, { timestamps: true })

export default mongoose.model('SchoolSettings', schoolSettingsSchema)
