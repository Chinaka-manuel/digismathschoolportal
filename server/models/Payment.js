import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, index: true },
  reference: { type: String, required: true, unique: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN' },
  method: { type: String, enum: ['paystack', 'stripe', 'paypal', 'bank_transfer'], required: true },
  provider: String,
  purpose: { type: String, required: true },
  status: { type: String, enum: ['pending', 'successful', 'failed', 'reversed'], default: 'pending', index: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  webhookEventId: { type: String, unique: true, sparse: true, index: true },
}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)
