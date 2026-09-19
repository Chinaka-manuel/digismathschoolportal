import SchoolSettings from '../models/SchoolSettings.js'
import mongoose from 'mongoose'

const publicFields = 'schoolName logoUrl address phone email whatsappNumber whatsappDefaultMessage socialLinks description mission vision academicPrograms'
const defaults = { schoolName: 'Northbridge International School', address: '14 Orchard Lane, Abuja, Nigeria', phone: '+234 800 555 0198', email: 'hello@northbridge.edu', description: 'A place to grow curious minds, courageous hearts, and a lifelong love of learning.' }
export async function getPublicSettings() { if (mongoose.connection.readyState !== 1) return defaults; return (await SchoolSettings.findOne({ key: 'school' }).select(publicFields).lean()) || defaults }
export async function updateSettings(input) { return SchoolSettings.findOneAndUpdate({ key: 'school' }, { ...input, key: 'school' }, { upsert: true, new: true, runValidators: true }).select('-bankDetails').lean() }
