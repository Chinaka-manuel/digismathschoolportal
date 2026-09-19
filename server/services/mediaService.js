import { Readable } from 'node:stream'
import cloudinary, { assertCloudinaryConfigured } from '../config/cloudinary.js'

export async function uploadBuffer(file, { folder, resourceType = 'auto' }) {
  assertCloudinaryConfigured()
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType, use_filename: false, unique_filename: true, overwrite: false }, (error, result) => error ? reject(error) : resolve(result))
    Readable.from(file.buffer).pipe(upload)
  })
}

export async function destroyAsset(publicId, resourceType = 'image') {
  assertCloudinaryConfigured()
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true })
}
