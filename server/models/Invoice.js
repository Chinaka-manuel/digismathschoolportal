import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN' },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending', index: true },
  dueDate: Date,
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  notes: String,
}, { timestamps: true })

export default mongoose.model('Invoice', invoiceSchema)
