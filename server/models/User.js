import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  profileImageUrl: String,
  profileImagePublicId: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  refreshTokenHash: { type: String, select: false },
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'ADMISSION_OFFICER'], default: 'PARENT', index: true },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  // Only the hash of the reset token is stored, so a database leak cannot be
  // replayed against the reset endpoint.
  passwordResetTokenHash: { type: String, select: false, index: true },
  passwordResetExpires: { type: Date, select: false },
  passwordChangedAt: Date,
}, { timestamps: true })

userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ createdAt: -1 })

export default mongoose.model('User', userSchema)
