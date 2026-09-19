import mongoose from 'mongoose'

const admissionSchema = new mongoose.Schema({
  applicationNumber: { type: String, required: true, unique: true, index: true },
  applicantName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, index: true },
  requestedClass: { type: String, required: true, index: true },
  status: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Waitlisted'], default: 'Pending', index: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true })

export default mongoose.model('Admission', admissionSchema)
