import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret, secure: true })

export function assertCloudinaryConfigured() {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    const error = new Error('Cloudinary media storage is not configured')
    error.statusCode = 503
    throw error
  }
}

export default cloudinary
