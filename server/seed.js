import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { env } from './config/env.js'
import User from './models/User.js'
import SchoolSettings from './models/SchoolSettings.js'
import Class from './models/Class.js'
import Event from './models/Event.js'
import Department from './models/Department.js'
import Subject from './models/Subject.js'
import AcademicSession from './models/AcademicSession.js'
import Term from './models/Term.js'
import Announcement from './models/Announcement.js'
import News from './models/News.js'
import Gallery from './models/Gallery.js'

const demoUsers = [
  ['Super Admin', 'superadmin@northbridge.test', 'SUPER_ADMIN'],
  ['School Admin', 'admin@northbridge.test', 'ADMIN'],
  ['Principal', 'principal@northbridge.test', 'PRINCIPAL'],
  ['Teacher Demo', 'teacher@northbridge.test', 'TEACHER'],
  ['Staff Demo', 'staff@northbridge.test', 'STAFF'],
  ['Student Demo', 'student@northbridge.test', 'STUDENT'],
  ['Parent Demo', 'parent@northbridge.test', 'PARENT'],
  ['Accountant Demo', 'accountant@northbridge.test', 'ACCOUNTANT'],
  ['Admissions Officer', 'admissions@northbridge.test', 'ADMISSION_OFFICER'],
]

async function seed() {
  if (!env.mongoUri) throw new Error('MONGO_URI is required to seed the database')
  await mongoose.connect(env.mongoUri)
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12)
  await Promise.all(demoUsers.map(([name, email, role]) => User.updateOne({ email }, { $setOnInsert: { name, email, role, passwordHash, permissions: [] } }, { upsert: true })))
  await SchoolSettings.updateOne({ key: 'school' }, { $set: { schoolName: 'Northbridge International School', address: '14 Orchard Lane, Abuja, Nigeria', phone: '+234 800 555 0198', email: 'hello@northbridge.edu', description: 'A place to grow curious minds, courageous hearts, and a lifelong love of learning.', mission: 'To develop confident, compassionate learners ready to shape a changing world.', vision: 'A flourishing community of curious minds and courageous hearts.', academicPrograms: [{ name: 'Early Years', ages: '3-5' }, { name: 'Primary School', ages: '6-11' }, { name: 'Secondary School', ages: '12-18' }] } }, { upsert: true })
  await Promise.all([['Early Years', 'Nursery'], ['Primary School', 'Primary'], ['JSS 1', 'Junior Secondary'], ['SS 1', 'Senior Secondary']].map(([name, level]) => Class.updateOne({ name }, { $setOnInsert: { name, level, capacity: 30 } }, { upsert: true })))
  await Event.updateOne({ title: 'Parent community breakfast' }, { $setOnInsert: { title: 'Parent community breakfast', type: 'Meeting', startsAt: new Date('2026-08-29T09:00:00Z'), location: 'Northbridge campus', isPublished: true } }, { upsert: true })

  const [science, arts] = await Promise.all([
    Department.findOneAndUpdate({ name: 'Sciences' }, { $setOnInsert: { name: 'Sciences', description: 'Physics, Chemistry, Biology' } }, { upsert: true, new: true }),
    Department.findOneAndUpdate({ name: 'Arts' }, { $setOnInsert: { name: 'Arts', description: 'Literature, History, Arts' } }, { upsert: true, new: true }),
  ])
  await Promise.all([
    Subject.findOneAndUpdate({ code: 'MTH' }, { $setOnInsert: { name: 'Mathematics', code: 'MTH', department: science._id } }, { upsert: true }),
    Subject.findOneAndUpdate({ code: 'ENG' }, { $setOnInsert: { name: 'English', code: 'ENG', department: arts._id } }, { upsert: true }),
    Subject.findOneAndUpdate({ code: 'PHY' }, { $setOnInsert: { name: 'Physics', code: 'PHY', department: science._id } }, { upsert: true }),
    Subject.findOneAndUpdate({ code: 'CHM' }, { $setOnInsert: { name: 'Chemistry', code: 'CHM', department: science._id } }, { upsert: true }),
  ])

  const session = await AcademicSession.findOneAndUpdate({ name: '2025/2026' }, { $setOnInsert: { name: '2025/2026', startYear: 2025, endYear: 2026, isActive: true } }, { upsert: true, new: true })
  await Promise.all([
    Term.findOneAndUpdate({ name: 'First Term', session: session._id }, { $setOnInsert: { name: 'First Term', session: session._id, startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20'), isActive: true } }, { upsert: true }),
    Term.findOneAndUpdate({ name: 'Second Term', session: session._id }, { $setOnInsert: { name: 'Second Term', session: session._id, startDate: new Date('2026-01-10'), endDate: new Date('2026-04-10'), isActive: false } }, { upsert: true }),
  ])

  const admin = await User.findOne({ email: 'admin@northbridge.test' })
  await Promise.all([
    Announcement.create({ title: 'Welcome back to school', body: 'We are excited to begin the new academic session.', author: admin._id, audience: ['ALL'], isPublished: true }),
    News.create({ title: 'Northbridge wins regional science fair', slug: 'northbridge-wins-regional-science-fair', excerpt: 'Our students took first place at the regional science competition.', content: 'Full story here.', category: 'Achievements', author: (await User.findOne({ email: 'admin@northbridge.test' }))._id, status: 'published', publishedAt: new Date() }),
    Gallery.create({ title: 'Science laboratory', mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', mediaPublicId: 'northbridge/gallery/science-lab', kind: 'image', category: 'Campus', isPublished: true }),
  ])

  console.log(`Seeded ${demoUsers.length} demo roles. Demo password: ChangeMe123!`)
  await mongoose.disconnect()
}
seed().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1) })
