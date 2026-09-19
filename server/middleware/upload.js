import multer from 'multer'

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'])
const storage = multer.memoryStorage()
const fileFilter = (req, file, callback) => {
	if (allowed.has(file.mimetype)) return callback(null, true)
	const error = new Error('Only JPG, PNG, WEBP, MP4, WEBM, and PDF files are allowed')
	error.statusCode = 422
	return callback(error)
}
export const secureUpload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 5 } })
export const profileImageUpload = multer({ storage, fileFilter: (req, file, callback) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? callback(null, true) : callback(Object.assign(new Error('A profile image must be JPG, PNG, or WEBP'), { statusCode: 422 })), limits: { fileSize: 5 * 1024 * 1024, files: 1 } })
export const videoUpload = multer({ storage, fileFilter: (req, file, callback) => file.mimetype.startsWith('video/') ? callback(null, true) : callback(Object.assign(new Error('A video must be MP4 or WEBM'), { statusCode: 422 })), limits: { fileSize: 50 * 1024 * 1024, files: 1 } })
