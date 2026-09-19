import crypto from 'node:crypto'
import Student from '../models/Student.js'
import { env } from '../config/env.js'

function sign(value) { return crypto.createHmac('sha256', env.accessSecret).update(value).digest('base64url') }
export function createVerificationToken(studentId) { const payload = `${studentId}.${Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365}`; return `${payload}.${sign(payload)}` }
function verifyToken(token) { const [studentId, expires, signature] = token.split('.'); const payload = `${studentId}.${expires}`; if (!studentId || !expires || !signature || Number(expires) < Math.floor(Date.now() / 1000) || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) { const error = new Error('Invalid or expired verification token'); error.statusCode = 404; throw error }; return studentId }
export async function getVerificationProfile(token) { const studentId = verifyToken(token); const student = await Student.findOne({ _id: studentId, status: { $ne: 'inactive' } }).select('studentId fullName photoUrl status').lean(); if (!student) { const error = new Error('Student verification record not found'); error.statusCode = 404; throw error }; return student }
